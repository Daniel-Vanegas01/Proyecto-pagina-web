import { supabase } from "../../../supabase/client";

// ======================
// TRAER MORA
// ======================
export const getMoraMes = async (anio, mes) => {
  const { data, error } = await supabase
    .from("intereses_ibc")
    .select("mora")
    .eq("anio", Number(anio))
    .eq("mes", Number(mes))
    .single();

  if (error || !data) return 0;

  return Number(data.mora);
};

// ======================
// MESES COMPLETOS ENTRE FECHAS
// ======================
export const getMesesCompletos = (inicio, fin) => {
  const start = new Date(inicio);
  const end = new Date(fin);

  const meses = [];
  const cursor = new Date(start);

  cursor.setDate(1);
  cursor.setMonth(cursor.getMonth() + 1);

  while (
    cursor.getFullYear() < end.getFullYear() ||
    (cursor.getFullYear() === end.getFullYear() &&
      cursor.getMonth() < end.getMonth())
  ) {
    meses.push({
      mes: cursor.getMonth() + 1,
      anio: cursor.getFullYear(),
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return meses;
};

// ======================
// CÁLCULO FACTURA (INTERESES)
// ======================
export const calcularLiquidacionFactura = async (factura) => {
  const saldo = Number(factura.saldo);

  const fv = new Date(factura.fecha_vencimiento);
  const fl = new Date(factura.fecha_liquidacion);

  let totalCompletos = 0;

  // ======================
  // MESES COMPLETOS
  // ======================
  const meses = getMesesCompletos(
    factura.fecha_vencimiento,
    factura.fecha_liquidacion
  );

  for (const m of meses) {
    const mora = await getMoraMes(m.anio, m.mes);
    const valor = saldo * (mora / 100);
    totalCompletos += valor;
  }

  // ======================
  // MESES INCOMPLETOS
  // ======================
  const diasMes = new Date(
    fv.getFullYear(),
    fv.getMonth() + 1,
    0
  ).getDate();

  const diasInicio = diasMes - fv.getDate();
  const diasFin = fl.getDate();

  const moraInicio = await getMoraMes(
    fv.getFullYear(),
    fv.getMonth() + 1
  );

  const moraFin = await getMoraMes(
    fl.getFullYear(),
    fl.getMonth() + 1
  );

  const valorInicio =
    (saldo * (moraInicio / 100) / 30) * diasInicio;

  const valorFin =
    (saldo * (moraFin / 100) / 30) * diasFin;

  const totalIncompletos = valorInicio + valorFin;

  // ======================
  // TOTAL FACTURA
  // ======================
  const total = totalCompletos + totalIncompletos;

  return {
    mesesCompletos: totalCompletos,
    mesesIncompletos: totalIncompletos,
    total,
  };
};

// =======================================================
// 🧾 NUEVO: CÁLCULO PARA DOCUMENTO FINAL (ABOGADO)
// =======================================================
export const calcularDocumentoLiquidacion = (facturas, calculos) => {
  let totalSaldos = 0;
  let totalIntereses = 0;

  const filas = facturas.map((f, index) => {
    const saldo = Number(f.saldo);
    const intereses = calculos[f.id]?.total || 0;

    totalSaldos += saldo;
    totalIntereses += intereses;

    const fecha = new Date(f.fecha_vencimiento);

    const diasMora = f.dias_mora || 0;

    return {
      numero: index + 1,
      factura: f.factura,
      saldo,
      fecha_vencimiento: f.fecha_vencimiento,
      dias_mora: diasMora,
      total_interes: intereses,
    };
  });

  // SUBTOTAL
  const subtotal = totalSaldos + totalIntereses;

  // HONORARIOS 10%
  const honorarios = subtotal * 0.10;

  // TOTAL FINAL
  const totalFinal = subtotal + honorarios;

  return {
    filas,
    totalSaldos,
    totalIntereses,
    subtotal,
    honorarios,
    totalFinal,
  };
};