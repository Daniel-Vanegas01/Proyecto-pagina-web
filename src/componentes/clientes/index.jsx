import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client";
import "./style.css";

function Clientes() {
  const [search, setSearch] = useState("");
  const [resultado, setResultado] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!search.trim()) return alert("Ingresa NIT o Cédula para buscar.");

    const { data: cliente, error } = await supabase
      .from("clientes")
      .select("*")
      .ilike("nit", `%${search}%`)
      .single();

    if (error || !cliente) {
      setResultado(null);
      alert("Cliente no encontrado.");
    } else {
      setResultado(cliente);
    }
  };

  const handleNewClient = () => {
    navigate("/nuevo-cliente");
  };

  const handleViewClient = (clienteId) => {
    navigate(`/cliente/${clienteId}`);
  };

  return (
    <div className="clientes-container">
      <h1 className="clientes-title">Clientes</h1>

      <div className="clientes-inner">
        <input
          type="text"
          placeholder="Buscar por NIT / Cédula"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="clientes-search"
        />
        <div className="clientes-buttons">
          <button className="clientes-button" onClick={handleSearch}>
            Buscar
          </button>
          <button className="clientes-button" onClick={handleNewClient}>
            Nuevo Cliente
          </button>
        </div>

        {resultado && (
          <div className="clientes-result">
            <p><strong>Nombre:</strong> {resultado.nombre}</p>
            <p><strong>Tipo de Cliente:</strong> {resultado.tipo_cliente}</p>
            <p><strong>NIT / Cédula:</strong> {resultado.nit}</p>
            <button
              className="clientes-button"
              onClick={() => handleViewClient(resultado.id)}
            >
              Ver Cliente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Clientes;