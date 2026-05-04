import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";

import "./style.css";


function CrearFactura() {
  const { negocioId } = useParams();
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);

  const [facturas, setFacturas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [facturaActiva, setFacturaActiva] = useState(null);

  const [formFactura, setFormFactura] = useState({
    nombre: "",
    saldo: "",
    fechaVencimiento: "",
    fechaLiquidacion: ""
  });

  // ======================
  // LOAD DATA
  // ======================
  useEffect(() => {
    fetchNegocio();
    fetchFacturas();
  }, []);

  const fetchNegocio = async () => {
    const { data } = await supabase
      .from("negocios")
      .select("*")
      .eq("id", negocioId)
      .single();

    if (data) setNegocio(data);
    setLoading(false);
  };

  const fetchFacturas = async () => {
    const { data } = await supabase
      .from("facturas")
      .select("*")
      .eq("negocio_id", negocioId)
      .order("numero", { ascending: true });

    if (data) setFacturas(data || []);
  };

  // ======================
  // UTILIDADES
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
  // GUARDAR FACTURA
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
      negocio_id: Number(negocioId), // 🔥 importante (BIGINT)
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

    setFacturas((prev) => [...prev, data]);

    setFormFactura({
      nombre: "",
      saldo: "",
      fechaVencimiento: "",
      fechaLiquidacion: ""
    });

    setMostrarFormulario(false);
  };

  // ======================
  // UI STATES
  // ======================
  if (loading) return <div>Cargando...</div>;
  if (!negocio) return <div>Negocio no encontrado</div>;

  return (
  <div className="crear-factura-container">

    <div className="crear-factura-card">

      <div className="crear-header">
        <h2>Facturas del negocio</h2>
        <button className="back-button" onClick={() => navigate(-1)}>
          Regresar
        </button>
      </div>

      <div className="crear-info">
        <p><b>Consecutivo:</b> {negocio.consecutivo}</p>
        <p><b>Deudor:</b> {negocio.deudor_nombre}</p>
      </div>

      {/* BOTÓN CREAR */}
      <button
        className="main-button"
        onClick={() => setMostrarFormulario(true)}
      >
        Crear factura
      </button>

      {/* ================= FORMULARIO ================= */}
      {mostrarFormulario && (
        <div>

          <h3>Nueva Factura</h3>

          <table className="factura-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Factura</th>
                <th>Saldo</th>
                <th>F. Vto</th>
                <th>Día</th>
                <th>F. Lq</th>
                <th>Día</th>
                <th>Días Mora</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>{generarNumeroFactura()}</td>

                <td>
                  <input
                    value={formFactura.nombre}
                    onChange={(e) =>
                      setFormFactura({ ...formFactura, nombre: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={formFactura.saldo}
                    onChange={(e) =>
                      setFormFactura({ ...formFactura, saldo: e.target.value })
                    }
                  />
                </td>

                <td>
                  <input
                    type="date"
                    value={formFactura.fechaVencimiento}
                    onChange={(e) =>
                      setFormFactura({
                        ...formFactura,
                        fechaVencimiento: e.target.value
                      })
                    }
                  />
                </td>

                <td>{obtenerDia(formFactura.fechaVencimiento)}</td>

                <td>
                  <input
                    type="date"
                    value={formFactura.fechaLiquidacion}
                    onChange={(e) =>
                      setFormFactura({
                        ...formFactura,
                        fechaLiquidacion: e.target.value
                      })
                    }
                  />
                </td>

                <td>{obtenerDia(formFactura.fechaLiquidacion)}</td>

                <td>
                  {calcularDiasMora(
                    formFactura.fechaVencimiento,
                    formFactura.fechaLiquidacion
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <button
            className="main-button"
            onClick={agregarFactura}
            style={{ marginTop: "10px" }}
          >
            Guardar factura
          </button>

        </div>
      )}

      {/* ================= FACTURAS ================= */}
      <h3 style={{ marginTop: "20px" }}>Facturas creadas</h3>

      <div className="factura-selector">
        {facturas.map((f, i) => (
          <button key={f.id} onClick={() => setFacturaActiva(f)}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* ================= DETALLE ================= */}
      {facturaActiva && (
        <div className="factura-detalle">
          <h3>Factura {facturaActiva.numero}</h3>

          <p><b>Factura:</b> {facturaActiva.factura}</p>
          <p><b>Saldo:</b> {facturaActiva.saldo}</p>
          <p><b>Fecha vencimiento:</b> {facturaActiva.fecha_vencimiento}</p>
          <p><b>Fecha liquidación:</b> {facturaActiva.fecha_liquidacion}</p>
          <p><b>Días mora:</b> {facturaActiva.dias_mora}</p>
        </div>
      )}

    </div>
  </div>
);
}

export default CrearFactura;