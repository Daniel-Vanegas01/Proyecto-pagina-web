export const obtenerDia = (fecha) => {
  return new Date(fecha).getDate();
};

export const obtenerDiasMes = (fecha) => {
  const f = new Date(fecha);
  return new Date(f.getFullYear(), f.getMonth() + 1, 0).getDate();
};

// 🔥 IBC → MORA (decimal)
export const calcularMora = (ibc) => {
  return ((ibc / 12) * 1.5) / 100;
};

// 🔥 YA USA DECIMAL
export const calcularEmpieza = (saldo, mora) => {
  return saldo * mora;
};

export const calcularValorParcial = (valorMensual, dias) => {
  return (valorMensual / 30) * dias;
};

export const calcularDiasMora = (fechaV, fechaL) => {
  const f1 = new Date(fechaV);
  const f2 = new Date(fechaL);
  return Math.floor((f2 - f1) / (1000 * 60 * 60 * 24));
};

// 🔥 MESES COMPLETOS
export const calcularMesesCompletos = (factura, intereses) => {
  const inicio = new Date(factura.fecha);
  const fin = new Date(factura.fechaLiq);

  let total = 0;

  let current = new Date(inicio);
  current.setMonth(current.getMonth() + 1);

  while (
    current.getFullYear() < fin.getFullYear() ||
    (current.getFullYear() === fin.getFullYear() &&
      current.getMonth() < fin.getMonth())
  ) {
    const mes = current.getMonth() + 1;
    const anio = current.getFullYear();

    const ibc = intereses?.[anio]?.[mes] || 0;
    const mora = calcularMora(ibc);

    const valorMes = calcularEmpieza(factura.saldo, mora);

    total += valorMes;

    current.setMonth(current.getMonth() + 1);
  }

  return total;
};