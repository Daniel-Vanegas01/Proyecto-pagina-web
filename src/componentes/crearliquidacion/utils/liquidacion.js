import { supabase } from "../supabase/client";

// ======================
// UTILIDADES FECHAS
// ======================

export const getMes = (fecha) => {
  return new Date(fecha).getMonth() + 1;
};

export const getAnio = (fecha) => {
  return new Date(fecha).getFullYear();
};

export const getDia = (fecha) => {
  return new Date(fecha).getDate();
};

// ======================
// TRAER MORA DESDE BD
// ======================

export const getMoraMes = async (anio, mes) => {
  const { data, error } = await supabase
    .from("intereses_ibc")
    .select("mora")
    .eq("anio", anio)
    .eq("mes", mes)
    .single();

  if (error || !data) return 0;

  return Number(data.mora);
};

// ======================
// MESES COMPLETOS ENTRE FECHAS
// (excluye mes inicial y final)
// ======================

export const getMesesCompletos = (inicio, fin) => {
  const start = new Date(inicio);
  const end = new Date(fin);

  const meses = [];

  const cursor = new Date(start);
  cursor.setDate(1);
  cursor.setMonth(cursor.getMonth() + 1);

  while (cursor.getFullYear() < end.getFullYear() ||
        (cursor.getFullYear() === end.getFullYear() &&
         cursor.getMonth() < end.getMonth())) {

    meses.push({
      mes: cursor.getMonth() + 1,
      anio: cursor.getFullYear()
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return meses;
};

// ======================
// MES COMPLETO
// ======================

export const calcularMesCompleto = (saldo, mora) => {
  return saldo * (mora / 100);
};

// ======================
// MES INICIAL (DÍAS RESTANTES)
// ======================

export const calcularMesInicial = async (saldo, fechaVencimiento) => {
  const dia = getDia(fechaVencimiento);
  const mes = getMes(fechaVencimiento);
  const anio = getAnio(fechaVencimiento);

  const mora = await getMoraMes(anio, mes);

  const valorDia = (saldo * (mora / 100)) / 30;
  const diasRestantes = 30 - dia;

  return valorDia * diasRestantes;
};

// ======================
// MES FINAL (DÍAS TRANSCURRIDOS)
// ======================

export const calcularMesFinal = async (saldo, fechaLiquidacion) => {
  const dia = getDia(fechaLiquidacion);
  const mes = getMes(fechaLiquidacion);
  const anio = getAnio(fechaLiquidacion);

  const mora = await getMoraMes(anio, mes);

  const valorDia = (saldo * (mora / 100)) / 30;

  return valorDia * dia;
};

// ======================
// FUNCIÓN PRINCIPAL
// ======================

export const calcularLiquidacionFactura = async (factura) => {
  const saldo = Number(factura.saldo);

  const inicio = factura.fecha_vencimiento;
  const fin = factura.fecha_liquidacion;

  let total = 0;

  const detalle = [];

  // 1. MES INICIAL (parcial)
  const inicial = await calcularMesInicial(saldo, inicio);
  total += inicial;

  detalle.push({
    tipo: "inicio",
    valor: inicial
  });

  // 2. MESES COMPLETOS
  const meses = getMesesCompletos(inicio, fin);

  for (const m of meses) {
    const mora = await getMoraMes(m.anio, m.mes);

    const valor = calcularMesCompleto(saldo, mora);

    total += valor;

    detalle.push({
      tipo: "completo",
      mes: m.mes,
      anio: m.anio,
      mora,
      valor
    });
  }

  // 3. MES FINAL (parcial)
  const final = await calcularMesFinal(saldo, fin);
  total += final;

  detalle.push({
    tipo: "final",
    valor: final
  });

  return {
    total,
    detalle
  };
};