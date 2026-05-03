import {
  calcularEmpieza,
  calcularValorParcial,
  calcularMesesCompletos,
  calcularDiasMora,
  obtenerDia,
  obtenerDiasMes
} from "./utils/calculos";
import "./detalle.css";

function DetalleFactura({ factura, fechaLiquidacion, intereses }) {
  if (!fechaLiquidacion) return <p>Seleccione fecha de liquidación</p>;

  const fechaV = new Date(factura.fecha);
  const fechaL = new Date(fechaLiquidacion);

  const mesV = fechaV.getMonth() + 1;
  const anioV = fechaV.getFullYear();

  const mesL = fechaL.getMonth() + 1;
  const anioL = fechaL.getFullYear();

  const ibcInicio = intereses?.[anioV]?.[mesV]?.ibc || 0;
  const ibcFinal = intereses?.[anioL]?.[mesL]?.ibc || 0;

  // 🔹 INICIO (mes vencimiento)
  const empieza = calcularEmpieza(factura.saldo, ibcInicio);
  const diasMes = obtenerDiasMes(factura.fecha);
  const diasRestantes = diasMes - obtenerDia(factura.fecha);
  const valorInicio = calcularValorParcial(empieza, diasRestantes);

  // 🔹 FINAL (mes liquidación)
  const termina = calcularEmpieza(factura.saldo, ibcFinal);
  const diasLiq = obtenerDia(fechaLiquidacion);
  const valorFinal = calcularValorParcial(termina, diasLiq);

  // 🔥 MESES COMPLETOS
  const mesesCompletos = calcularMesesCompletos(
    factura,
    fechaLiquidacion,
    intereses
  );

  // 🔥 MESES INCOMPLETOS
  const mesesIncompletos = valorInicio + valorFinal;

  // 🔥 TOTAL
  const totalIntereses = mesesIncompletos + mesesCompletos;

  // 🔥 DÍAS EN MORA
  const diasMora = calcularDiasMora(factura.fecha, fechaLiquidacion);

  return (
    <div className="section">
      <h3>Detalle Factura {factura.numero}</h3>

      <p>Empieza: {empieza.toFixed(0)}</p>
      <p>Valor inicio: {valorInicio.toFixed(0)}</p>

      <p>Termina: {termina.toFixed(0)}</p>
      <p>Valor final: {valorFinal.toFixed(0)}</p>

      <hr />

      <p>Meses incompletos: {mesesIncompletos.toFixed(0)}</p>
      <p>Meses completos: {mesesCompletos.toFixed(0)}</p>

      <h4>Total intereses: {totalIntereses.toFixed(0)}</h4>

      <h4>Días en mora: {diasMora}</h4>
    </div>
  );
}

export default DetalleFactura;