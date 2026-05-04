import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import "./style.css";

function Moduloliquidacion() {
  const [consecutivo, setConsecutivo] = useState("");
  const [negocio, setNegocio] = useState(null);
  const navigate = useNavigate();

  // BUSCAR NEGOCIO POR CONSECUTIVO
  const handleBuscar = async () => {
    if (!consecutivo.trim()) {
      return alert("Ingresa un consecutivo");
    }

    const { data, error } = await supabase
      .from("negocios")
      .select("*")
      .eq("consecutivo", Number(consecutivo))
      .single();

    if (error || !data) {
      console.error(error);
      setNegocio(null);
      return alert("Negocio no encontrado");
    }

    setNegocio(data);
  };

  // IR A FACTURAS
  const handleFacturas = () => {
    if (!negocio) return;
    navigate(`/facturas/${negocio.id}`);
  };

  // GENERAR LIQUIDACIÓN (TABLA RESUMEN FINAL)
  const handleLiquidacion = () => {
    if (!negocio) return;
    navigate(`/generar-liquidacion/${negocio.id}`);
  };

  // DOCUMENTO FINAL (TABLA PARA ABOGADO / ENVÍO)
  const handleDocumento = () => {
    if (!negocio) return;
    navigate(`/documento-liquidacion/${negocio.id}`);
  };

  // VOLVER
  const handleBack = () => {
    navigate("/home");
  };

  return (
    <div className="clientes-container">

      <button className="clientes-button" onClick={handleBack}>
        Regresar
      </button>

      <h1 className="clientes-title">Módulo de Liquidación</h1>

      <div className="clientes-inner">

        <input
          className="clientes-search"
          type="number"
          placeholder="Buscar por consecutivo (Ej: 1530)"
          value={consecutivo}
          onChange={(e) => setConsecutivo(e.target.value)}
        />

        <div className="clientes-buttons">
          <button className="clientes-button" onClick={handleBuscar}>
            Buscar
          </button>
        </div>

        {/* RESULTADO */}
        {negocio && (
          <div className="resultado-negocio">

            <h3>Negocio encontrado</h3>

            <p><strong>Consecutivo:</strong> {negocio.consecutivo}</p>
            <p><strong>Deudor:</strong> {negocio.deudor_nombre}</p>
            <p><strong>NIT:</strong> {negocio.deudor_nit}</p>
            <p><strong>Capital:</strong> {negocio.capital}</p>

            <div className="clientes-buttons" style={{ marginTop: "15px" }}>

              <button
                className="clientes-button"
                onClick={handleFacturas}
              >
                Gestionar facturas
              </button>

              <button
                className="clientes-button"
                onClick={handleLiquidacion}
              >
                Generar liquidación
              </button>

              <button
                className="clientes-button"
                onClick={handleDocumento}
              >
                Documento liquidación
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Moduloliquidacion;