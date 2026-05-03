import { useState } from "react";

function ResumenLiquidacion({
  facturaActiva,
  facturas,
  calcularValorE,
  calcularValorF,
  calcularMesesCompletos,
  supabase
}) {

  const [mostrar, setMostrar] = useState(false);

  const formatearCOP = (valor) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2
    }).format(valor || 0);
  };

  const calcularDiasMora = (fecha) => {
    if (!fecha) return 0;
    const hoy = new Date();
    const venc = new Date(fecha);
    const diff = hoy - venc;
    return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
  };

  const tabla = facturas.map((f, i) => {
    const interes =
      calcularValorE(f) +
      calcularValorF(f) +
      calcularMesesCompletos(f);

    return {
      item: i + 1,
      numero: f.nombre,
      saldo: Number(f.saldo || 0),
      fecha: f.fecha_vencimiento,
      mora: calcularDiasMora(f.fecha_vencimiento),
      interes
    };
  });

  const guardar = async () => {

    const totalIntereses = tabla.reduce((a, b) => a + b.interes, 0);
    const totalSaldo = tabla.reduce((a, b) => a + b.saldo, 0);

    const payload = {
      negocio_consecutivo: facturaActiva.consecutivo,

      detalle: {
        facturas: tabla
      },

      total_intereses: totalIntereses,
      total_general: totalSaldo + totalIntereses
    };

    const { error } = await supabase
      .from("liquidaciones")
      .insert([payload]);

    if (error) {
      console.error(error.message);
      return alert("Error guardando liquidación");
    }

    alert("Liquidación final guardada");
  };

  return (
    <div className="calculos">

      <h3>Sección 3: Liquidación final</h3>

      <button onClick={() => setMostrar(!mostrar)}>
        Generar liquidación
      </button>

      {mostrar && (
        <>
          <table border="1" width="100%">
            <thead>
              <tr>
                <th>#</th>
                <th>Factura</th>
                <th>Saldo</th>
                <th>Vencimiento</th>
                <th>Mora</th>
                <th>Interés</th>
              </tr>
            </thead>

            <tbody>
              {tabla.map((r, i) => (
                <tr key={i}>
                  <td>{r.item}</td>
                  <td>{r.numero}</td>
                  <td>{formatearCOP(r.saldo)}</td>
                  <td>{r.fecha}</td>
                  <td>{r.mora}</td>
                  <td>{formatearCOP(r.interes)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <br />

          <p>
            <b>
              Total intereses:{" "}
              {formatearCOP(
                tabla.reduce((a, b) => a + b.interes, 0)
              )}
            </b>
          </p>

          <button onClick={guardar}>
            Guardar liquidación final
          </button>
        </>
      )}

    </div>
  );
}

export default ResumenLiquidacion;