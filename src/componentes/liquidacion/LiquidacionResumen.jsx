import { calcularDiasMora } from "./utils/calculos";
import "./resumen.css";

function LiquidacionResumen({ facturas }) {
  return (
    <div>
      <h2>Resumen</h2>

      {facturas.map(f => (
        <p key={f.id}>
          {f.numero} | {f.nombre} | {f.saldo} | {calcularDiasMora(f.fecha, f.fechaLiq)} días
        </p>
      ))}
    </div>
  );
}

export default LiquidacionResumen;