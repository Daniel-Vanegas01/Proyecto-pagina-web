import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase/client"; // asegúrate de la ruta correcta
import "./style.css";

function NuevoCliente() {
  const navigate = useNavigate();

  // Campos obligatorios
  const [nombre, setNombre] = useState("");
  const [tipoCliente, setTipoCliente] = useState("Persona Natural"); // Nuevo campo
  const [nit, setNit] = useState("");
  const [repLegal, setRepLegal] = useState("");
  const [repLegalSup, setRepLegalSup] = useState("");

  // Campos múltiples con límite de 3
  const [telefonos, setTelefonos] = useState([""]);
  const [correos, setCorreos] = useState([""]);
  const [direcciones, setDirecciones] = useState([""]);

  // Notas
  const [notas, setNotas] = useState([]);
  const [mostrarInputNota, setMostrarInputNota] = useState(false);

  // Funciones para campos múltiples
  const addField = (arr, setter) => {
    if (arr.length < 3) setter([...arr, ""]);
  };

  const updateField = (index, value, arr, setter) => {
    const newArr = [...arr];
    newArr[index] = value;
    setter(newArr);
  };

  const removeField = (index, arr, setter) => {
    const newArr = arr.filter((_, i) => i !== index);
    setter(newArr);
  };

  // Funciones para notas
  const addNota = (texto) => {
    if (texto.trim() === "") return;
    const fecha = new Date().toLocaleDateString();
    setNotas([...notas, { texto, fecha }]);
    setMostrarInputNota(false);
  };

  const removeNota = (index) => {
    setNotas(notas.filter((_, i) => i !== index));
  };

  // Guardar cliente en Supabase
  const handleSubmit = async () => {
    if (!nombre.trim() || !nit.trim() || !repLegal.trim()) {
      return alert("Los campos obligatorios deben estar llenos");
    }

    const { data, error } = await supabase.from("clientes").insert([
      {
        nombre,
        tipo_cliente: tipoCliente, // <-- Guardamos el tipo de cliente
        nit,
        rep_legal: repLegal,
        rep_legal_suplente: repLegalSup,
        telefonos: telefonos.length ? telefonos : [],
        correos: correos.length ? correos : [],
        direcciones: direcciones.length ? direcciones : [],
        notas: notas.length ? notas : []
      }
    ]);

    if (error) {
      console.error(error);
      alert("Error al guardar cliente: " + error.message);
    } else {
      alert("Cliente creado correctamente");
      navigate("/clientes");
    }
  };

  return (
    <div className="nuevo-cliente-container">
      <div className="nuevo-cliente-card">
        <h1 className="nuevo-cliente-title">Nuevo Cliente</h1>

        <form className="nuevo-cliente-form" onSubmit={(e) => e.preventDefault()}>
          {/* Sección 1: Datos generales */}
          <div className="form-section">
            <h3>Datos generales</h3>
            <input type="text" placeholder="Nombre / Razón social" value={nombre} onChange={(e) => setNombre(e.target.value)} />

            {/* NUEVO SELECT: Tipo de cliente */}
            <select value={tipoCliente} onChange={(e) => setTipoCliente(e.target.value)}>
              <option value="Persona Natural">Persona Natural</option>
              <option value="Persona Jurídica">Persona Jurídica</option>
            </select>

            <input type="text" placeholder="NIT / Cédula" value={nit} onChange={(e) => setNit(e.target.value)} />
            <input type="text" placeholder="Representante legal" value={repLegal} onChange={(e) => setRepLegal(e.target.value)} />
            <input type="text" placeholder="Representante legal suplente (opcional)" value={repLegalSup} onChange={(e) => setRepLegalSup(e.target.value)} />
          </div>

          {/* Sección 2: Teléfonos */}
          <div className="form-section">
            <h3>Teléfonos</h3>
            {telefonos.map((t, i) => (
              <div key={i} className="field-item">
                <input type="text" placeholder={`Teléfono ${i + 1}`} value={t} onChange={(e) => updateField(i, e.target.value, telefonos, setTelefonos)} />
                {telefonos.length > 1 && <button type="button" onClick={() => removeField(i, telefonos, setTelefonos)}>X</button>}
              </div>
            ))}
            {telefonos.length < 3 && <button type="button" onClick={() => addField(telefonos, setTelefonos)}>Añadir teléfono</button>}
          </div>

          {/* Sección 3: Correos */}
          <div className="form-section">
            <h3>Correos</h3>
            {correos.map((c, i) => (
              <div key={i} className="field-item">
                <input type="email" placeholder={`Correo ${i + 1}`} value={c} onChange={(e) => updateField(i, e.target.value, correos, setCorreos)} />
                {correos.length > 1 && <button type="button" onClick={() => removeField(i, correos, setCorreos)}>X</button>}
              </div>
            ))}
            {correos.length < 3 && <button type="button" onClick={() => addField(correos, setCorreos)}>Añadir correo</button>}
          </div>

          {/* Sección 4: Direcciones */}
          <div className="form-section">
            <h3>Direcciones</h3>
            {direcciones.map((d, i) => (
              <div key={i} className="field-item">
                <input type="text" placeholder={`Dirección ${i + 1}`} value={d} onChange={(e) => updateField(i, e.target.value, direcciones, setDirecciones)} />
                {direcciones.length > 1 && <button type="button" onClick={() => removeField(i, direcciones, setDirecciones)}>X</button>}
              </div>
            ))}
            {direcciones.length < 3 && <button type="button" onClick={() => addField(direcciones, setDirecciones)}>Añadir dirección</button>}
          </div>

          {/* Sección 5: Notas */}
          <div className="form-section">
            <h3>Notas</h3>
            {!mostrarInputNota && <button type="button" onClick={() => setMostrarInputNota(true)}>Crear nota</button>}
            {mostrarInputNota && (
              <div className="nota-input-container">
                <input type="text" id="nota-input" placeholder="Escribe tu nota" />
                <button type="button" onClick={() => {
                  const notaInput = document.getElementById("nota-input");
                  addNota(notaInput.value);
                  notaInput.value = "";
                }}>Guardar nota</button>
              </div>
            )}
            <ul>
              {notas.map((n, i) => (
                <li key={i}>
                  {n.fecha}: {n.texto} <button type="button" onClick={() => removeNota(i)}>X</button>
                </li>
              ))}
            </ul>
          </div>

          <button className="submit-button" type="button" onClick={handleSubmit}>Guardar Cliente</button>
        </form>
      </div>
    </div>
  );
}

export default NuevoCliente;