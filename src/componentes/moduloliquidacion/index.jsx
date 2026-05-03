import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import "./style.css";

function Moduloliquidacion() {
  const [consecutivo, setConsecutivo] = useState("");
  const [negocio, setNegocio] = useState(null);
  const navigate = useNavigate();

  const handleBuscar = async () => {
    if (!consecutivo.trim()) {
      return alert("Ingresa un consecutivo");
    }

    const { data, error } = await supabase
      .from("negocios")
      .select("id, consecutivo, deudor_nombre, deudor_nit")
      .eq("consecutivo", consecutivo)
      .single();

    if (error || !data) {
      setNegocio(null);
      return alert("Negocio no encontrado");
    }

    setNegocio(data);
  };

  const handleCrearLiquidacion = () => {
    if (!negocio) return;

    // 🔥 IMPORTANTE: puedes crear varias, no se limita nada
    navigate(`/liquidacion/${negocio.id}`);
  };

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <div className="clientes-container">

      <button className="clientes-button" onClick={handleBack}>
        Regresar
      </button>

      <h1 className="clientes-title">Liquidaciones</h1>

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

        {/* 🔥 RESULTADO DE BUSQUEDA */}
        {negocio && (
          <div className="resultado-negocio">

            <h3>Negocio encontrado</h3>

            <p><strong>Consecutivo:</strong> {negocio.consecutivo}</p>
            <p><strong>Nombre:</strong> {negocio.deudor_nombre}</p>
            <p><strong>NIT:</strong> {negocio.deudor_nit}</p>

            <button
              className="clientes-button"
              onClick={handleCrearLiquidacion}
            >
              + Crear liquidación
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default Moduloliquidacion;