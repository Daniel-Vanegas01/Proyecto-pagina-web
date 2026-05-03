import { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import "./interes.css";

const MESES = [
  "enero", "febrero", "marzo", "abril",
  "mayo", "junio", "julio", "agosto",
  "septiembre", "octubre", "noviembre", "diciembre"
];

// 📅 años dinámicos
const generarAnios = () => {
  const añoActual = new Date().getFullYear();
  const inicio = añoActual - 10;
  const fin = añoActual + 10;

  const años = [];
  for (let i = inicio; i <= fin; i++) {
    años.push(i);
  }
  return años;
};

const ANIOS = generarAnios();

function InteresesSection() {

  const [anio, setAnio] = useState(new Date().getFullYear());
  const [datos, setDatos] = useState({});

  // 📥 cargar datos por año
  useEffect(() => {
    cargarIntereses();
  }, [anio]);

  const cargarIntereses = async () => {

    const { data, error } = await supabase
      .from("intereses")
      .select("*")
      .eq("anio", anio)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("ERROR CARGANDO:", error.message);
      return;
    }

    setDatos(data?.data || {});
  };

  // 🔥 convierte string europeo a número real
  const normalizarNumero = (valor) => {
    if (!valor) return 0;

    return Number(
      valor
        .toString()
        .replace(/\./g, "")
        .replace(",", ".")
    );
  };

  // 📊 cálculo interés mora
  const calcularInteres = (ibc) => {
    const valor = normalizarNumero(ibc);
    if (!valor) return 0;

    return (valor / 12) * 1.5;
  };

  // ✏️ actualizar mes (NO rompe el input)
  const actualizarMes = (mes, valor) => {

    const nuevo = {
      ...datos,
      [mes]: {
        ibc: valor, // 👈 se guarda tal cual (16,59)
        interes: calcularInteres(valor)
      }
    };

    setDatos(nuevo);
  };

  // 💾 guardar en Supabase
  const guardar = async () => {

    const payload = {
      anio,
      data: datos
    };

    const { error } = await supabase
      .from("intereses")
      .upsert(payload, { onConflict: "anio" });

    if (error) {
      console.error("ERROR GUARDANDO:", error.message);
      alert("Error guardando intereses");
      return;
    }

    alert("Intereses guardados correctamente");
  };

  return (
    <div className="intereses">

      <h2>Intereses IBC</h2>

      {/* SELECT AÑO */}
      <select
        value={anio}
        onChange={(e) => setAnio(Number(e.target.value))}
      >
        {ANIOS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      {/* TABLA */}
      <table>

        <thead>
          <tr>
            <th>Mes</th>
            <th>IBC</th>
            <th>Interés mora</th>
          </tr>
        </thead>

        <tbody>

          {MESES.map((mes) => (
            <tr key={mes}>

              <td>{mes}</td>

              <td>
                <input
                  type="text"
                  value={datos?.[mes]?.ibc || ""}
                  onChange={(e) =>
                    actualizarMes(mes, e.target.value)
                  }
                  placeholder="ej: 16,59"
                />
              </td>

              <td>
                {datos?.[mes]?.interes
                  ? datos[mes].interes.toFixed(2) + "%"
                  : "0%"}
              </td>

            </tr>
          ))}

        </tbody>

      </table>

      <button onClick={guardar}>
        Guardar cambios
      </button>

    </div>
  );
}

export default InteresesSection;