import { useEffect, useState } from "react";
import { supabase } from "../../supabase/client";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Intereses() {
  const navigate = useNavigate();

  const [anio, setAnio] = useState(2026);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchIntereses();
  }, [anio]);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril",
    "Mayo", "Junio", "Julio", "Agosto",
    "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // ======================
  // TRAER DATOS
  // ======================
  const fetchIntereses = async () => {
    const { data, error } = await supabase
      .from("intereses_ibc")
      .select("*")
      .eq("anio", anio)
      .order("mes", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setData(data || []);
  };

  // ======================
  // CALCULO MORA
  // ======================
  const calcularMora = (ibc) => {
    const valor = Number(ibc);
    if (!valor || isNaN(valor)) return "";

    return ((valor / 12) * 1.5).toFixed(3);
  };

  // ======================
  // OBTENER VALOR MES
  // ======================
  const obtenerValor = (mes) => {
    const item = data.find(d => d.mes === mes);
    return item ? item.ibc : "";
  };

  // ======================
  // GUARDAR / ACTUALIZAR (FIX DEFINITIVO)
  // ======================
  const guardarMes = async (mes, ibc) => {
    const ibcNum = Number(ibc);

    if (!ibcNum || isNaN(ibcNum)) {
      return alert("Ingresa un valor válido de IBC");
    }

    const mora = (ibcNum / 12) * 1.5;

    const payload = {
      anio,
      mes,
      ibc: ibcNum,
      mora
    };

    // 🔥 UPSERT REAL (requiere UNIQUE(anio,mes))
    const { data: result, error } = await supabase
      .from("intereses_ibc")
      .upsert(payload, {
        onConflict: "anio,mes",
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error("❌ ERROR:", error);
      alert(error.message);
      return;
    }

    console.log("✔ Guardado/Actualizado:", result);

    fetchIntereses();
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div style={{ padding: "20px" }}>

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate("/home")}
        style={{
          marginBottom: "20px",
          padding: "10px 15px",
          borderRadius: "10px",
          border: "none",
          background: "#3f5ccf",
          color: "white",
          cursor: "pointer"
        }}
      >
        ← Volver al Home
      </button>

      <h2>Intereses IBC</h2>

      {/* AÑO */}
      <div>
        <label>Año: </label>
        <input
          type="number"
          value={anio}
          onChange={(e) => setAnio(Number(e.target.value))}
        />
      </div>

      <br />

      {/* TABLA */}
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Mes</th>
            <th>IBC (%)</th>
            <th>Mora (%)</th>
            <th>Acción</th>
          </tr>
        </thead>

        <tbody>
          {meses.map((mes, index) => {
            const mesNum = index + 1;

            return (
              <tr key={mesNum}>
                <td>{mes}</td>

                <td>
                  <input
                    type="number"
                    value={obtenerValor(mesNum)}
                    onChange={(e) => {
                      const nuevo = [
                        ...data.filter(d => d.mes !== mesNum),
                        {
                          anio,
                          mes: mesNum,
                          ibc: Number(e.target.value)
                        }
                      ];

                      setData(nuevo);
                    }}
                  />
                </td>

                <td>
                  {calcularMora(obtenerValor(mesNum))}
                </td>

                <td>
                  <button onClick={() => guardarMes(mesNum, obtenerValor(mesNum))}>
                    Guardar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
}

export default Intereses;