import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import { calcularLiquidacionFactura } from "./utils/liquidacion";
import "./style.css";

function GenerarLiquidacion() {
  const { negocioId } = useParams();
  const navigate = useNavigate();

  const [negocio, setNegocio] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [calculos, setCalculos] = useState({});
  const [guardando, setGuardando] = useState(false);

  // ======================
  // FETCH NEGOCIO
  // ======================
  useEffect(() => {
    fetchNegocio();
  }, []);

  const fetchNegocio = async () => {
    const { data } = await supabase
      .from("negocios")
      .select("*")
      .eq("id", negocioId)
      .single();

    if (data) setNegocio(data);
  };

  // ======================
  // FETCH FACTURAS
  // ======================
  useEffect(() => {
    if (!negocioId) return;
    fetchFacturas();
  }, [negocioId]);

  const fetchFacturas = async () => {
    const { data } = await supabase
      .from("facturas")
      .select("*")
      .eq("negocio_id", negocioId)
      .order("numero", { ascending: true });

    if (data) setFacturas(data);
  };

  // ======================
  // CALCULAR FACTURAS
  // ======================
  useEffect(() => {
    if (facturas.length > 0) {
      calcularTodo(facturas);
    }
  }, [facturas]);

  const calcularTodo = async (lista) => {
    const resultados = {};

    for (const factura of lista) {
      const res = await calcularLiquidacionFactura(factura);

      resultados[factura.id] = {
        mesesCompletos: res?.mesesCompletos ?? 0,
        mesesIncompletos: res?.mesesIncompletos ?? 0,
        totalIntereses: res?.total ?? 0,
      };
    }

    setCalculos(resultados);
  };

  // ======================
  // GUARDAR LIQUIDACIÓN
  // ======================
  const guardarLiquidacion = async () => {
    try {
      setGuardando(true);

      if (!facturas.length) {
        alert("No hay facturas para liquidar");
        return;
      }

      // ======================
      // TOTALES
      // ======================
      const totalFacturas = facturas.reduce(
        (acc, f) => acc + Number(f.saldo),
        0
      );

      const totalIntereses = facturas.reduce((acc, f) => {
        return acc + (calculos[f.id]?.totalIntereses || 0);
      }, 0);

      const subtotal = totalFacturas + totalIntereses;
      const honorarios = subtotal * 0.1;
      const totalFinal = subtotal + honorarios;

      // ======================
      // 1. INSERT LIQUIDACIÓN
      // ======================
      const { data: liquidacion, error: errorLiquidacion } = await supabase
        .from("liquidaciones")
        .insert([
          {
            negocio_id: negocioId,
            total_facturas: totalFacturas,
            total_intereses: totalIntereses,
            subtotal,
            honorarios,
            total_final: totalFinal,
          },
        ])
        .select()
        .single();

      if (errorLiquidacion) {
        console.error(errorLiquidacion);
        alert("Error guardando liquidación");
        return;
      }

      // ======================
      // 2. DETALLE POR FACTURA
      // ======================
      const detalle = facturas.map((f) => ({
        liquidacion_id: liquidacion.id,
        negocio_id: negocioId,
        factura_id: f.id,
        factura: f.factura,
        saldo: Number(f.saldo),

        meses_completos: calculos[f.id]?.mesesCompletos || 0,
        meses_incompletos: calculos[f.id]?.mesesIncompletos || 0,
        total_intereses: calculos[f.id]?.totalIntereses || 0,
      }));

      const { error: errorDetalle } = await supabase
        .from("liquidacion_facturas")
        .insert(detalle);

      if (errorDetalle) {
        console.error(errorDetalle);
        alert("Error guardando detalle de liquidación");
        return;
      }

      alert("Liquidación guardada correctamente");
      navigate("/liquidaciones");

    } catch (err) {
      console.error(err);
      alert("Error inesperado");
    } finally {
      setGuardando(false);
    }
  };

  // ======================
  // UI
  // ======================
  const volver = () => navigate(-1);

  if (!negocio) return <div>Cargando...</div>;

return (
  <div className="generar-liquidacion-container">

    <div className="generar-liquidacion-card">

      <div className="generar-header">
        <h2>Generar Liquidación</h2>
        <button className="back-button" onClick={volver}>
          Regresar
        </button>
      </div>

      <div className="generar-info">
        <p><b>Consecutivo:</b> {negocio.consecutivo}</p>
        <p><b>Nombre:</b> {negocio.deudor_nombre}</p>
        <p><b>NIT:</b> {negocio.deudor_nit}</p>
      </div>

      <table className="generar-table">
        <thead>
          <tr>
            <th>Factura</th>
            <th>Saldo</th>
            <th>Fecha Vto</th>
            <th>Fecha Lq</th>
            <th>Interés meses completos</th>
            <th>Interés meses incompletos</th>
            <th>Total interés</th>
          </tr>
        </thead>

        <tbody>
          {facturas.map((f) => (
            <tr key={f.id}>
              <td>{f.factura}</td>
              <td>{Number(f.saldo).toLocaleString()}</td>
              <td>{f.fecha_vencimiento}</td>
              <td>{f.fecha_liquidacion}</td>

              <td>
                {calculos[f.id]?.mesesCompletos?.toLocaleString() || 0}
              </td>

              <td>
                {calculos[f.id]?.mesesIncompletos?.toLocaleString() || 0}
              </td>

              <td>
                {calculos[f.id]?.totalIntereses?.toLocaleString() || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        className="generar-button"
        onClick={guardarLiquidacion}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar Liquidación"}
      </button>

    </div>
  </div>
);
}

export default GenerarLiquidacion;