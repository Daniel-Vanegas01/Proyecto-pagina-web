import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabase/client";
import "./style.css";

function EditarCliente() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados
  const [nombre, setNombre] = useState("");
  const [tipoCliente, setTipoCliente] = useState("Persona Natural");
  const [nit, setNit] = useState("");
  const [repLegal, setRepLegal] = useState("");
  const [repLegalSup, setRepLegalSup] = useState("");

  const [telefonos, setTelefonos] = useState([""]);
  const [correos, setCorreos] = useState([""]);
  const [direcciones, setDirecciones] = useState([""]);

  const [notas, setNotas] = useState([]);
  const [mostrarInputNota, setMostrarInputNota] = useState(false);

  // 🔥 Cargar datos del cliente
  useEffect(() => {
    fetchCliente();
  }, []);

  const fetchCliente = async () => {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert("Error al cargar cliente");
      return;
    }

    setNombre(data.nombre || "");
    setTipoCliente(data.tipo_cliente || "Persona Natural");
    setNit(data.nit || "");
    setRepLegal(data.rep_legal || "");
    setRepLegalSup(data.rep_legal_suplente || "");

    setTelefonos(data.telefonos?.length ? data.telefonos : [""]);
    setCorreos(data.correos?.length ? data.correos : [""]);
    setDirecciones(data.direcciones?.length ? data.direcciones : [""]);

    setNotas(data.notas?.length ? data.notas : []);
  };

  // Funciones reutilizadas
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

  // Notas
  const addNota = (texto) => {
    if (!texto.trim()) return;
    const fecha = new Date().toLocaleDateString();
    setNotas([...notas, { texto, fecha }]);
    setMostrarInputNota(false);
  };

  const removeNota = (index) => {
    setNotas(notas.filter((_, i) => i !== index));
  };

  // 🔥 Actualizar cliente
  const handleUpdate = async () => {
    if (!nombre.trim() || !nit.trim() || !repLegal.trim()) {
      return alert("Los campos obligatorios deben estar llenos");
    }

    const { error } = await supabase
      .from("clientes")
      .update({
        nombre,
        tipo_cliente: tipoCliente,
        nit,
        rep_legal: repLegal,
        rep_legal_suplente: repLegalSup,
        telefonos,
        correos,
        direcciones,
        notas
      })
      .eq("id", id);

    if (error) {
      alert("Error al actualizar cliente");
    } else {
      alert("Cliente actualizado correctamente");
      navigate(`/cliente/${id}`);
    }
  };

  return (
    <div className="nuevo-cliente-container">
      <div className="nuevo-cliente-card">
        <h1 className="nuevo-cliente-title">Editar Cliente</h1>

        <form className="nuevo-cliente-form">

          {/* Datos generales */}
          <div className="form-section">
            <h3>Datos generales</h3>

            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre / Razón social"
            />

            <select
              value={tipoCliente}
              onChange={(e) => setTipoCliente(e.target.value)}
            >
              <option value="Persona Natural">Persona Natural</option>
              <option value="Persona Jurídica">Persona Jurídica</option>
            </select>

            <input
              type="text"
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              placeholder="NIT / Cédula"
            />

            <input
              type="text"
              value={repLegal}
              onChange={(e) => setRepLegal(e.target.value)}
              placeholder="Representante legal"
            />

            <input
              type="text"
              value={repLegalSup}
              onChange={(e) => setRepLegalSup(e.target.value)}
              placeholder="Representante legal suplente"
            />
          </div>

          {/* Teléfonos */}
          <div className="form-section">
            <h3>Teléfonos</h3>
            {telefonos.map((t, i) => (
              <div key={i} className="field-item">
                <input
                  type="text"
                  value={t}
                  onChange={(e) =>
                    updateField(i, e.target.value, telefonos, setTelefonos)
                  }
                />
                {telefonos.length > 1 && (
                  <button type="button" onClick={() => removeField(i, telefonos, setTelefonos)}>X</button>
                )}
              </div>
            ))}
            {telefonos.length < 3 && (
              <button type="button" onClick={() => addField(telefonos, setTelefonos)}>
                Añadir teléfono
              </button>
            )}
          </div>

          {/* Correos */}
          <div className="form-section">
            <h3>Correos</h3>
            {correos.map((c, i) => (
              <div key={i} className="field-item">
                <input
                  type="email"
                  value={c}
                  onChange={(e) =>
                    updateField(i, e.target.value, correos, setCorreos)
                  }
                />
                {correos.length > 1 && (
                  <button type="button" onClick={() => removeField(i, correos, setCorreos)}>X</button>
                )}
              </div>
            ))}
            {correos.length < 3 && (
              <button type="button" onClick={() => addField(correos, setCorreos)}>
                Añadir correo
              </button>
            )}
          </div>

          {/* Direcciones */}
          <div className="form-section">
            <h3>Direcciones</h3>
            {direcciones.map((d, i) => (
              <div key={i} className="field-item">
                <input
                  type="text"
                  value={d}
                  onChange={(e) =>
                    updateField(i, e.target.value, direcciones, setDirecciones)
                  }
                />
                {direcciones.length > 1 && (
                  <button type="button" onClick={() => removeField(i, direcciones, setDirecciones)}>X</button>
                )}
              </div>
            ))}
            {direcciones.length < 3 && (
              <button type="button" onClick={() => addField(direcciones, setDirecciones)}>
                Añadir dirección
              </button>
            )}
          </div>

          {/* Notas */}
          <div className="form-section">
            <h3>Notas</h3>

            {!mostrarInputNota && (
              <button type="button" onClick={() => setMostrarInputNota(true)}>
                Crear nota
              </button>
            )}

            {mostrarInputNota && (
              <div className="nota-input-container">
                <input type="text" id="nota-input" />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("nota-input");
                    addNota(input.value);
                    input.value = "";
                  }}
                >
                  Guardar nota
                </button>
              </div>
            )}

            {notas.map((n, i) => (
              <p key={i}>
                {n.fecha}: {n.texto}
                <button onClick={() => removeNota(i)}> X </button>
              </p>
            ))}
          </div>

          <button className="submit-button" type="button" onClick={handleUpdate}>
            Guardar Cambios
          </button>

        </form>
      </div>
    </div>
  );
}

export default EditarCliente;