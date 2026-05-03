import { useState, useEffect } from "react";
import { supabase } from "../../supabase/client";
import "./liquidacion.css";

import LiquidacionFinal from "./LiquidacionFinal";
import InteresesSection from "./InteresesSection";

function Liquidacion() {

  const [tab, setTab] = useState("facturas");
  const [facturas, setFacturas] = useState([]);
  const [activa, setActiva] = useState(null);
  const [intereses, setIntereses] = useState({});
  const [debugCalculo, setDebugCalculo] = useState([]);

  // 📥 cargar datos
  useEffect(() => {
    cargarFacturas();
    cargarIntereses();
  }, []);

  const cargarFacturas = async () => {
    const { data, error } = await supabase
      .from("facturas")
      .select("*")
      .order("id", { ascending: true });

    if (error) return console.error(error.message);
    setFacturas(data || []);
  };

  const cargarIntereses = async () => {
    const { data, error } = await supabase
      .from("intereses")
      .select("*");

    if (error) return console.error(error.message);

    const mapa = {};
    data.forEach((row) => {
      mapa[row.anio] = row.data;
    });

    setIntereses(mapa);
  };

  const MESES = [
    "enero","febrero","marzo","abril",
    "mayo","junio","julio","agosto",
    "septiembre","octubre","noviembre","diciembre"
  ];

  const obtenerAnio = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha).getFullYear();
  };

  const obtenerDia = (fecha) => {
    if (!fecha) return 0;
    return Number(fecha.substring(8, 10));
  };

  const DIAS_MES = {
    1:31,2:28,3:31,4:30,5:31,6:30,
    7:31,8:31,9:30,10:31,11:30,12:31
  };

  const obtenerDiasMes = (fecha) => {
    if (!fecha) return 30;
    const mes = new Date(fecha).getMonth() + 1;
    return DIAS_MES[mes] || 30;
  };

  const obtenerInteres = (fecha) => {
    const anio = obtenerAnio(fecha);
    const mes = MESES[new Date(fecha).getMonth()];

    const valor = intereses?.[anio]?.[mes]?.interes;
    if (!valor) return 0;

    return Number(String(valor).replace(",", ".")) || 0;
  };

  const valorMes = (f, fecha) => {
    const saldo = Number(f.saldo || 0);
    const interes = obtenerInteres(fecha);
    return saldo * (interes / 100);
  };

  const calcularEmpiezaTotal = (f) => {
    if (!f.fecha_vencimiento) return 0;
    return valorMes(f, f.fecha_vencimiento);
  };

  const calcularTerminaTotal = (f) => {
    if (!f.fecha_liquidacion) return 0;
    return valorMes(f, f.fecha_liquidacion);
  };

  const calcularValorE = (f) => {
    if (!f.fecha_vencimiento) return 0;

    const base = valorMes(f, f.fecha_vencimiento);
    const dia = obtenerDia(f.fecha_vencimiento);
    const diasMes = obtenerDiasMes(f.fecha_vencimiento);

    return (base / 30) * (diasMes - dia);
  };

  const calcularValorF = (f) => {
    if (!f.fecha_liquidacion) return 0;

    const base = valorMes(f, f.fecha_liquidacion);
    const dia = obtenerDia(f.fecha_liquidacion);

    return (base / 30) * dia;
  };

  const calcularMesesCompletos = (f, generarDebug = false) => {

    if (!f.fecha_vencimiento || !f.fecha_liquidacion) return 0;

    const saldo = Number(f.saldo || 0);

    const inicio = new Date(f.fecha_vencimiento);
    const fin = new Date(f.fecha_liquidacion);

    let total = 0;
    let detalle = [];

    let actual = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 1);
    const ultimo = new Date(fin.getFullYear(), fin.getMonth(), 1);
    ultimo.setMonth(ultimo.getMonth() - 1);

    while (actual <= ultimo) {

      const anio = actual.getFullYear();
      const mes = MESES[actual.getMonth()];

      const interesRaw = intereses?.[anio]?.[mes]?.interes;
      const interes = Number(String(interesRaw || 0).replace(",", ".")) || 0;

      const valor = saldo * (interes / 100);

      total += valor;
      detalle.push({ mes, anio, interes, valor });

      actual.setMonth(actual.getMonth() + 1);
    }

    if (generarDebug) setDebugCalculo(detalle);

    return total;
  };

  const guardarLiquidacion = async (f) => {

    const mesesIncompletos =
      (calcularValorE(f) || 0) + (calcularValorF(f) || 0);

    const mesesCompletos =
      calcularMesesCompletos(f) || 0;

    const totalIntereses =
      mesesIncompletos + mesesCompletos;

    const totalGeneral =
      (Number(f.saldo || 0)) + totalIntereses;

    const payload = {
      factura_id: f.id,
      negocio_consecutivo: f.negocio_consecutivo || null,

      empieza: calcularEmpiezaTotal(f) || 0,
      termina: calcularTerminaTotal(f) || 0,

      total_meses_incompletos: mesesIncompletos,
      total_meses_completos: mesesCompletos,

      total_intereses: totalIntereses,
      total_general: totalGeneral
    };

    const { error } = await supabase
      .from("liquidaciones")
      .insert([payload]);

    if (error) {
      console.error(error.message);
      alert("Error guardando liquidación");
      return;
    }

    alert("Liquidación guardada correctamente");
  };

  const crearFactura = async () => {

    const nueva = {
      nombre: "SIN NOMBRE",
      saldo: 0,
      fecha_vencimiento: null,
      fecha_liquidacion: null,
      dia_vencimiento: null,
      dia_liquidacion: null,
      dias_mora: null
    };

    const { data, error } = await supabase
      .from("facturas")
      .insert([nueva])
      .select();

    if (error) return console.error(error.message);

    setFacturas((prev) => [...prev, data[0]]);
    setActiva(data[0].id);
  };

  const actualizarFactura = (id, campo, valor) => {
    setFacturas((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, [campo]: valor } : f
      )
    );
  };

  const facturaActiva = facturas.find((f) => f.id === activa);

  const totalInteresesUI =
    facturaActiva
      ? (
          (calcularValorE(facturaActiva) || 0) +
          (calcularValorF(facturaActiva) || 0) +
          (calcularMesesCompletos(facturaActiva) || 0)
        )
      : 0;

  return (
    <div className="container">

      <h1>Sistema de Liquidación</h1>

      <div className="tabs">
        <button onClick={() => setTab("facturas")}>Facturas</button>
        <button onClick={() => setTab("intereses")}>Intereses</button>
      </div>

      {tab === "facturas" && (
        <>
          <div className="tabs">

            <button onClick={crearFactura}>+ Nueva factura</button>

            {facturas.map((f, i) => (
              <button key={f.id} onClick={() => setActiva(f.id)}>
                F-{i + 1}
              </button>
            ))}

          </div>

          {facturaActiva && (
            <div className="sheet">

              <h2>Factura F-{facturaActiva.id}</h2>

              <input
                value={facturaActiva.nombre || ""}
                onChange={(e) =>
                  actualizarFactura(facturaActiva.id, "nombre", e.target.value)
                }
              />

              <input
                value={facturaActiva.saldo || ""}
                onChange={(e) =>
                  actualizarFactura(facturaActiva.id, "saldo", e.target.value)
                }
              />

              <input
                type="date"
                value={facturaActiva.fecha_vencimiento || ""}
                onChange={(e) =>
                  actualizarFactura(facturaActiva.id, "fecha_vencimiento", e.target.value)
                }
              />

              <input
                type="date"
                value={facturaActiva.fecha_liquidacion || ""}
                onChange={(e) =>
                  actualizarFactura(facturaActiva.id, "fecha_liquidacion", e.target.value)
                }
              />

              <div className="calculos">

                <h3>Cálculos de liquidación</h3>

                <p>Empieza: {calcularEmpiezaTotal(facturaActiva).toFixed(0)} / valor-e: {calcularValorE(facturaActiva).toFixed(0)}</p>

                <p>Termina: {calcularTerminaTotal(facturaActiva).toFixed(0)} / valor-f: {calcularValorF(facturaActiva).toFixed(0)}</p>

                <p><b>Total meses incompletos: {(calcularValorE(facturaActiva) + calcularValorF(facturaActiva)).toFixed(0)}</b></p>

                <p><b>Total meses completos: {calcularMesesCompletos(facturaActiva).toFixed(0)}</b></p>

                <p><b>Total intereses: {totalInteresesUI.toFixed(0)}</b></p>

                <button onClick={() => guardarLiquidacion(facturaActiva)}>
                  Guardar resultados
                </button>

                <button onClick={() => calcularMesesCompletos(facturaActiva, true)}>
                  Validar cálculo
                </button>

              </div>

              {/* SECCIÓN 3 RESTAURADA SIN ROMPER TU CÓDIGO */}
              <LiquidacionFinal
                facturaActiva={facturaActiva}
                facturas={facturas}
                calcularValorE={calcularValorE}
                calcularValorF={calcularValorF}
                calcularMesesCompletos={calcularMesesCompletos}
                calcularEmpiezaTotal={calcularEmpiezaTotal}
                calcularTerminaTotal={calcularTerminaTotal}
                supabase={supabase}
              />

              {debugCalculo.length > 0 && (
                <div className="debug">
                  <h3>Detalle meses completos</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Año</th>
                        <th>Interés</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debugCalculo.map((d, i) => (
                        <tr key={i}>
                          <td>{d.mes}</td>
                          <td>{d.anio}</td>
                          <td>{d.interes}</td>
                          <td>{d.valor.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}
        </>
      )}

      {tab === "intereses" && <InteresesSection />}

    </div>
  );
}

export default Liquidacion;