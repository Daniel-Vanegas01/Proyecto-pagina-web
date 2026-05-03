import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./facturas.css";

function FacturasSection({ facturas, setFacturas }) {

  const [formVisible, setFormVisible] = useState(false);

  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState("");
  const [fecha, setFecha] = useState("");
  const [fechaLiq, setFechaLiq] = useState("");

  const obtenerDiaSeguro = (fecha) => {
    if (!fecha) return null;
    return Number(fecha.substring(8, 10));
  };

  const agregarFactura = async () => {

    // 🧠 VALIDACIÓN BÁSICA
    if (!nombre || !saldo || !fecha || !fechaLiq) {
      alert("Completa todos los campos");
      return;
    }

    const nuevaFactura = {
      numero_factura: nombre,
      nombre: nombre,
      saldo: Number(saldo),
      fecha_vencimiento: fecha,
      fecha_liquidacion: fechaLiq,
      dia_vencimiento: obtenerDiaSeguro(fecha),
      dia_liquidacion: obtenerDiaSeguro(fechaLiq),
      dias_mora: Math.floor(
        (new Date(fechaLiq) - new Date(fecha)) / (1000 * 60 * 60 * 24)
      )
    };

    const { data, error } = await supabase
      .from("facturas")
      .insert([nuevaFactura])
      .select();

    // ❌ ERROR REAL MOSTRADO EN UI
    if (error) {
      console.error(error);
      alert("Error guardando factura: " + error.message);
      return;
    }

    // ✔ actualizar estado
    setFacturas([...facturas, data[0]]);

    // limpiar
    setNombre("");
    setSaldo("");
    setFecha("");
    setFechaLiq("");
    setFormVisible(false);

    alert("Factura guardada correctamente");
  };

  return (
    <div>

      <button onClick={() => setFormVisible(true)}>
        + Agregar factura
      </button>

      {formVisible && (
        <div className="form">

          <input
            placeholder="Factura"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            placeholder="Saldo"
            type="number"
            value={saldo}
            onChange={(e) => setSaldo(e.target.value)}
          />

          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />

          <input
            type="date"
            value={fechaLiq}
            onChange={(e) => setFechaLiq(e.target.value)}
          />

          <button onClick={agregarFactura}>
            Guardar en base de datos
          </button>

        </div>
      )}

      <div className="facturas-list">
        {facturas.map((f) => (
          <div key={f.id}>
            F-{f.id} / {f.numero_factura}
          </div>
        ))}
      </div>

    </div>
  );
}

export default FacturasSection;