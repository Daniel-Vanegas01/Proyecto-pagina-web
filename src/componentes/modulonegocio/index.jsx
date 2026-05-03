import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import "./style.css";

function Modulonegocio() {
  const [consecutivo, setConsecutivo] = useState("");
  const navigate = useNavigate();

  const handleBuscar = async () => {
    if (!consecutivo.trim()) {
      return alert("Ingresa un consecutivo");
    }

    // 🔥 Buscar en la BD por consecutivo
    const { data, error } = await supabase
      .from("negocios")
      .select("id")
      .eq("consecutivo", consecutivo)
      .single();

    if (error || !data) {
      return alert("Negocio no encontrado");
    }

    // ✅ Redirigir con el ID real
    navigate(`/negocio/${data.id}`);
  };

  const handleBack = () => {
    navigate("/home");
  };

  return (
    <div className="clientes-container">

      {/* 🔙 Regresar */}
      <button className="clientes-button" onClick={handleBack}>
        Regresar
      </button>

      <h1 className="clientes-title">Negocios</h1>

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

      </div>
    </div>
  );
}

export default Modulonegocio;