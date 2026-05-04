  import { useEffect, useState } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import { supabase } from "../../supabase/client";

  function CrearLiquidacion() {
    const { negocioId } = useParams();
    const navigate = useNavigate();

    const [negocio, setNegocio] = useState(null);
    const [loading, setLoading] = useState(true);

    const [facturas, setFacturas] = useState([]);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [facturaActiva, setFacturaActiva] = useState(null);

    const [calculos, setCalculos] = useState({});

    // 🔥 NUEVO: toggle liquidación
    const [mostrarLiquidacion, setMostrarLiquidacion] = useState(false);

    const [formFactura, setFormFactura] = useState({
      nombre: "",
      saldo: "",
      fechaVencimiento: "",
      fechaLiquidacion: ""
    });

    useEffect(() => {
      fetchNegocio();
      fetchFacturas();
    }, []);

    useEffect(() => {
      if (facturaActiva) {
        verificarFactura(facturaActiva);
      }
    }, [facturaActiva]);

    const fetchNegocio = async () => {
      const { data, error } = await supabase
        .from("negocios")
        .select("*")
        .eq("id", negocioId)
        .single();

      if (!error) setNegocio(data);
      setLoading(false);
    };

    const fetchFacturas = async () => {
      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("negocio_id", negocioId)
        .order("numero", { ascending: true });

      if (!error) setFacturas(data || []);
    };

    // ======================
    // UTILIDADES FECHAS
    // ======================

    const obtenerDia = (fecha) => {
      if (!fecha) return "";
      return Number(fecha.split("-")[2]);
    };

    const calcularDiasMora = (fv, fl) => {
      if (!fv || !fl) return "";

      const diff = new Date(fl) - new Date(fv);
      return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
    };

    const generarNumeroFactura = () => facturas.length + 1;

    // ======================
    // MESES COMPLETOS
    // ======================

    const getMesesCompletos = (inicio, fin) => {
      const start = new Date(inicio);
      const end = new Date(fin);

      const meses = [];
      const cursor = new Date(start);

      cursor.setDate(1);
      cursor.setMonth(cursor.getMonth() + 1);

      while (
        cursor.getFullYear() < end.getFullYear() ||
        (cursor.getFullYear() === end.getFullYear() &&
          cursor.getMonth() < end.getMonth())
      ) {
        meses.push(new Date(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }

      return meses;
    };

    const getMoraMes = async (fecha) => {
      const mes = new Date(fecha).getMonth() + 1;
      const anio = new Date(fecha).getFullYear();

      const { data } = await supabase
        .from("intereses_ibc")
        .select("mora")
        .eq("anio", anio)
        .eq("mes", mes)
        .single();

      return Number(data?.mora || 0);
    };

    // ======================
    // VERIFICAR FACTURA
    // ======================

    const verificarFactura = async (factura) => {
      const meses = getMesesCompletos(
        factura.fecha_vencimiento,
        factura.fecha_liquidacion
      );

      let totalCompletos = 0;
      const detalle = [];

      for (const m of meses) {
        const mora = await getMoraMes(m);
        const valor = factura.saldo * (mora / 100);

        totalCompletos += valor;

        detalle.push({
          mes: m.getMonth() + 1,
          anio: m.getFullYear(),
          mora,
          valor,
          tipo: "completo"
        });
      }

      // ======================
      // INCOMPLETOS
      // ======================

      const fv = new Date(factura.fecha_vencimiento);
      const fl = new Date(factura.fecha_liquidacion);

      const diasMes = new Date(fv.getFullYear(), fv.getMonth() + 1, 0).getDate();

      const diasInicio = diasMes - fv.getDate();
      const diasFin = fl.getDate();

      const moraInicio = await getMoraMes(fv);
      const moraFin = await getMoraMes(fl);

      const valorInicio =
        (factura.saldo * (moraInicio / 100) / 30) * diasInicio;

      const valorFin =
        (factura.saldo * (moraFin / 100) / 30) * diasFin;

      const totalIncompletos = valorInicio + valorFin;

      const total = totalCompletos + totalIncompletos;

      setCalculos((prev) => ({
        ...prev,
        [factura.id]: {
          mesesCompletos: totalCompletos,
          mesesIncompletos: totalIncompletos,
          total,
          detalle
        }
      }));
    };

  // ======================
  // AGREGAR FACTURA
  // ======================
  const agregarFactura = async () => {
    if (
      !formFactura.nombre ||
      !formFactura.saldo ||
      !formFactura.fechaVencimiento ||
      !formFactura.fechaLiquidacion
    ) {
      return alert("Completa todos los campos");
    }

    const nuevaFactura = {
      negocio_id: negocioId,
      numero: generarNumeroFactura(),
      factura: formFactura.nombre,
      saldo: Number(formFactura.saldo),
      fecha_vencimiento: formFactura.fechaVencimiento,
      dia_vencimiento: obtenerDia(formFactura.fechaVencimiento),
      fecha_liquidacion: formFactura.fechaLiquidacion,
      dia_liquidacion: obtenerDia(formFactura.fechaLiquidacion),
      dias_mora: calcularDiasMora(
        formFactura.fechaVencimiento,
        formFactura.fechaLiquidacion
      )
    };

    const { data, error } = await supabase
      .from("facturas")
      .insert([nuevaFactura])
      .select()
      .single();

    if (error) {
      console.error(error);
      return alert("Error guardando factura");
    }

    setFacturas([...facturas, data]);

    setFormFactura({
      nombre: "",
      saldo: "",
      fechaVencimiento: "",
      fechaLiquidacion: ""
    });

    setMostrarFormulario(false);
  };
  // ======================
  // GUARDAR LIQUIDACIÓN EN BD
  // ======================
  const guardarLiquidacion = async () => {
    try {
      if (!facturas.length) {
        return alert("No hay facturas para guardar");
      }

      // 🔥 FORZAR CÁLCULO REAL (NO depender del state)
      const calculosLocales = {};

      for (const f of facturas) {
        if (!calculos[f.id]) {
          await verificarFactura(f);
        }

        // tomar el valor actualizado o fallback seguro
        const calc = calculos[f.id];

        calculosLocales[f.id] = {
          mesesCompletos: calc?.mesesCompletos || 0,
          mesesIncompletos: calc?.mesesIncompletos || 0,
          total: calc?.total || 0
        };
      }

      // 🔹 DETALLE POR FACTURA (USANDO VALORES LOCALES SEGUROS)
      const detalles = facturas.map((f) => ({
        negocio_id: negocioId,
        factura_id: f.id,
        factura: f.factura,
        saldo: Number(f.saldo),
        meses_completos: calculosLocales[f.id].mesesCompletos,
        meses_incompletos: calculosLocales[f.id].mesesIncompletos,
        total_intereses: calculosLocales[f.id].total
      }));

      const { error: errorDetalle } = await supabase
        .from("liquidacion_facturas")
        .insert(detalles);

      if (errorDetalle) {
        console.error(errorDetalle);
        return alert("Error guardando detalle de liquidación");
      }

      // 🔹 RESUMEN GENERAL
      const resumen = {
        negocio_id: negocioId,
        total_facturas: total,
        total_intereses: totalIntereses,
        subtotal,
        honorarios,
        total_final: totalFinal
      };

      const { error: errorResumen } = await supabase
        .from("liquidacion_deuda")
        .insert([resumen]);

      if (errorResumen) {
        console.error(errorResumen);
        return alert("Error guardando resumen de liquidación");
      }

      alert("Liquidación guardada correctamente");

    } catch (err) {
      console.error(err);
      alert("Error inesperado al guardar");
    }
  };

  // ======================
  // TOTALES
  // ======================
  const total = facturas.reduce((acc, f) => acc + Number(f.saldo), 0);

  const totalIntereses = facturas.reduce((acc, f) => {
    return acc + (calculos[f.id]?.total || 0);
  }, 0);

  const subtotal = total + totalIntereses;
  const honorarios = subtotal * 0.1;
  const totalFinal = subtotal + honorarios;

  if (loading) return <div>Cargando...</div>;
  if (!negocio) return <div>Negocio no encontrado</div>;


    return (
      <div>

        <button onClick={() => navigate(-1)}>Regresar</button>

        <h2>Crear Liquidación</h2>

        <div>
          <p><strong>Consecutivo:</strong> {negocio.consecutivo}</p>
          <p><strong>Deudor:</strong> {negocio.deudor_nombre}</p>
          <p><strong>NIT:</strong> {negocio.deudor_nit}</p>
        </div>

        <hr />

        <button onClick={() => setMostrarFormulario(true)}>
          + Crear Factura
        </button>

        {/* 🔥 NUEVO BOTÓN */}
        <button
          onClick={() => setMostrarLiquidacion(!mostrarLiquidacion)}
          style={{ marginLeft: "10px" }}
        >
          Liquidación deuda
        </button>

        <hr />

        {/* ================= TABLA LIQUIDACIÓN ================= */}
        {mostrarLiquidacion && (
          <div>
            <h3>LIQUIDACIÓN DEUDA</h3>

            <table border="1" width="100%">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Factura</th>
                  <th>Saldo</th>
                  <th>Fecha Vencimiento</th>
                  <th>Días Mora</th>
                  <th>Total Intereses</th>
                </tr>
              </thead>

              <tbody>
                {facturas.map((f, i) => (
                  <tr key={f.id}>
                    <td>{i + 1}</td>
                    <td>{f.factura}</td>
                    <td>{Number(f.saldo).toLocaleString()}</td>
                    <td>{f.fecha_vencimiento}</td>
                    <td>{f.dias_mora}</td>
                    <td>
                      {calculos[f.id]
                        ? calculos[f.id].total.toLocaleString()
                        : 0}
                    </td>
                  </tr>
                ))}

                <tr>
                  <td></td>
                  <td><b>TOTALES</b></td>
                  <td><b>{total.toLocaleString()}</b></td>
                  <td></td>
                  <td></td>
                  <td><b>{totalIntereses.toLocaleString()}</b></td>
                </tr>

                <tr>
                  <td colSpan="4"><b>SUBTOTAL</b></td>
                  <td></td>
                  <td><b>{subtotal.toLocaleString()}</b></td>
                </tr>

                <tr>
                  <td colSpan="4"><b>HONORARIOS (10%)</b></td>
                  <td></td>
                  <td><b>{honorarios.toLocaleString()}</b></td>
                </tr>

                <tr>
                  <td colSpan="4"><b>TOTAL DEUDA</b></td>
                  <td></td>
                  <td><b>{totalFinal.toLocaleString()}</b></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <hr />

        <h3>Facturas creadas:</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          {facturas.map((f, i) => (
            <button key={f.id} onClick={() => setFacturaActiva(f)}>
              {i + 1}
            </button>
          ))}
        </div>

        <hr />

        {facturaActiva && (
          <div>
            <h3>Factura {facturaActiva.numero}</h3>

            <p>Factura: {facturaActiva.factura}</p>
            <p>Saldo: {facturaActiva.saldo}</p>

            {calculos[facturaActiva.id] && (
              <div style={{ marginTop: "15px" }}>
                <h4>Resumen liquidación</h4>

                <p>Meses completos: {calculos[facturaActiva.id].mesesCompletos.toLocaleString()}</p>
                <p>Meses incompletos: {calculos[facturaActiva.id].mesesIncompletos.toLocaleString()}</p>

                <p><b>Total intereses: {calculos[facturaActiva.id].total.toLocaleString()}</b></p>
              </div>
            )}
          </div>
        )}

        <hr />

        <h3>Total facturas: {total}</h3>

        <button onClick={guardarLiquidacion}>
          Guardar Liquidación
        </button>
      </div>
    );
  }

  export default CrearLiquidacion;