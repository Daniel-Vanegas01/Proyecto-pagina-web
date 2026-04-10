import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabase/client";
import "./style.css";

function NuevoNegocio() {
  const navigate = useNavigate();
  const { clienteId } = useParams();

  const [fechaIngreso] = useState(new Date().toLocaleDateString());
  const [consecutivo, setConsecutivo] = useState(null);

  const [clienteNombre, setClienteNombre] = useState("");

  // Deudor
  const [deudorNombre, setDeudorNombre] = useState("");
  const [deudorNit, setDeudorNit] = useState("");
  const [paginaWeb, setPaginaWeb] = useState(""); // 🔥 NUEVO
  const [telefonos, setTelefonos] = useState([""]);
  const [correos, setCorreos] = useState([""]);
  const [direcciones, setDirecciones] = useState([""]);

  // Info jurídica
  const [capital, setCapital] = useState("");
  const [detalle, setDetalle] = useState("");

  useEffect(() => {
    fetchCliente();
    generarConsecutivo();
  }, []);

  const fetchCliente = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("nombre")
      .eq("id", clienteId)
      .single();

    if (data) setClienteNombre(data.nombre);
  };

  const generarConsecutivo = async () => {
    const { data } = await supabase
      .from("negocios")
      .select("consecutivo")
      .order("consecutivo", { ascending: false })
      .limit(1);

    if (!data || data.length === 0) {
      setConsecutivo(1530);
    } else {
      setConsecutivo(data[0].consecutivo + 1);
    }
  };

  // Campos dinámicos
  const addField = (arr, setter) => {
    if (arr.length < 5) setter([...arr, ""]);
  };

  const updateField = (index, value, arr, setter) => {
    const newArr = [...arr];
    newArr[index] = value;
    setter(newArr);
  };

  const removeField = (index, arr, setter) => {
    setter(arr.filter((_, i) => i !== index));
  };

  // Buscar Google
  const buscarEnGoogle = () => {
    const query = `${deudorNit} ${deudorNombre}`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  };

  // Botones rápidos
  const irAGoogle = () => window.open("https://www.google.com", "_blank");
  const irACamara = () => window.open("https://www.ccb.org.co", "_blank");
  const irARues = () => window.open("https://www.rues.org.co", "_blank");
  const irASupersociedades = () =>
    window.open("https://www.supersociedades.gov.co", "_blank");

  // Guardar
  const handleSubmit = async () => {
    if (!deudorNombre.trim() || !deudorNit.trim()) {
      return alert("Faltan datos del deudor");
    }

    const { error } = await supabase.from("negocios").insert([
      {
        cliente_id: clienteId,
        consecutivo,
        fecha_ingreso: fechaIngreso,
        deudor_nombre: deudorNombre,
        deudor_nit: deudorNit,
        pagina_web: paginaWeb, // 🔥 NUEVO
        telefonos,
        correos,
        direcciones,
        capital,
        detalle
      }
    ]);

    if (error) {
      alert("Error al guardar negocio");
    } else {
      alert("Negocio creado correctamente");
      navigate(`/cliente/${clienteId}`);
    }
  };

  return (
    <div className="nuevo-cliente-container">
      <div className="nuevo-cliente-card">
        <h1 className="nuevo-cliente-title">Nuevo Negocio</h1>

        <form className="nuevo-cliente-form">

          {/* INFO */}
          <div className="form-section">
            <h3>Información del negocio</h3>
            <p><strong>Cliente:</strong> {clienteNombre}</p>
            <p><strong>Fecha de ingreso:</strong> {fechaIngreso}</p>
            <p><strong>Consecutivo:</strong> {consecutivo || "Generando..."}</p>
          </div>

          {/* DEUDOR */}
          <div className="form-section">
            <h3>Deudor</h3>

            <input
              type="text"
              placeholder="Nombre del deudor"
              value={deudorNombre}
              onChange={(e) => setDeudorNombre(e.target.value)}
            />

            <input
              type="text"
              placeholder="NIT"
              value={deudorNit}
              onChange={(e) => setDeudorNit(e.target.value)}
            />

            {/* 🔥 NUEVO CAMPO */}
            <input
              type="text"
              placeholder="Página web (opcional)"
              value={paginaWeb}
              onChange={(e) => setPaginaWeb(e.target.value)}
            />

            <button type="button" onClick={buscarEnGoogle} className="search-button">
              🔎 Buscar en la web
            </button>

            <div className="web-buttons">
              <button type="button" onClick={irAGoogle}>Google</button>
              <button type="button" onClick={irACamara}>Cámara de Comercio</button>
              <button type="button" onClick={irARues}>RUES</button>
              <button type="button" onClick={irASupersociedades}>Registros Públicos</button>
            </div>
          </div>

          {/* TELÉFONOS */}
          <div className="form-section">
            <h3>Teléfonos</h3>
            {telefonos.map((t, i) => (
              <div key={i} className="field-item">
                <input value={t} onChange={(e) => updateField(i, e.target.value, telefonos, setTelefonos)} />
                {telefonos.length > 1 && (
                  <button type="button" onClick={() => removeField(i, telefonos, setTelefonos)}>X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addField(telefonos, setTelefonos)}>
              Añadir teléfono
            </button>
          </div>

          {/* CORREOS */}
          <div className="form-section">
            <h3>Correos</h3>
            {correos.map((c, i) => (
              <div key={i} className="field-item">
                <input value={c} onChange={(e) => updateField(i, e.target.value, correos, setCorreos)} />
                {correos.length > 1 && (
                  <button type="button" onClick={() => removeField(i, correos, setCorreos)}>X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addField(correos, setCorreos)}>
              Añadir correo
            </button>
          </div>

          {/* DIRECCIONES */}
          <div className="form-section">
            <h3>Direcciones</h3>
            {direcciones.map((d, i) => (
              <div key={i} className="field-item">
                <input value={d} onChange={(e) => updateField(i, e.target.value, direcciones, setDirecciones)} />
                {direcciones.length > 1 && (
                  <button type="button" onClick={() => removeField(i, direcciones, setDirecciones)}>X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addField(direcciones, setDirecciones)}>
              Añadir dirección
            </button>
          </div>

          {/* JURÍDICO */}
          <div className="form-section">
            <h3>Información jurídica</h3>

            <input
              type="text"
              placeholder="Capital"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
            />

            <textarea
              placeholder="Detalle del acuerdo..."
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
            />
          </div>

          <button className="submit-button" type="button" onClick={handleSubmit}>
            Guardar Negocio
          </button>

        </form>
      </div>
    </div>
  );
}

export default NuevoNegocio;