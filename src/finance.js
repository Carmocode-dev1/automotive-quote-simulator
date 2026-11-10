export const INSTALLMENT_TERMS = [60, 72, 84, 96, 108, 120];

function safePositive(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return 0;
  }
  return num;
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function computeMonthlyInstallment(capitalWithFee, annualTinPercent, months) {
  if (capitalWithFee <= 0 || months <= 0) {
    return 0;
  }
  const monthlyRate = safePositive(annualTinPercent) / 100 / 12;
  if (monthlyRate === 0) {
    return round2(capitalWithFee / months);
  }
  const factor = Math.pow(1 + monthlyRate, months);
  const pmt = (capitalWithFee * monthlyRate * factor) / (factor - 1);
  return round2(pmt);
}

export function computeQuoteFinancials({
  salePrice = 0,
  discount = 0,
  warranty = 0,
  downPayment = 0,
  annualTinPercent = 7.9,
  openingFeePercent = 2.0,
  terms = INSTALLMENT_TERMS,
} = {}) {
  const cleanSalePrice = round2(safePositive(salePrice));
  const cleanDiscount = round2(safePositive(discount));
  const cleanWarranty = round2(safePositive(warranty));
  const cleanDownPayment = round2(safePositive(downPayment));
  const cleanTin = safePositive(annualTinPercent);
  const cleanFee = safePositive(openingFeePercent);

  const offerTotal = round2(Math.max(0, cleanSalePrice - cleanDiscount + cleanWarranty));
  const financedCapital = round2(Math.max(0, offerTotal - cleanDownPayment));
  const openingFeeAmount = round2(financedCapital * (cleanFee / 100));
  const capitalWithFee = round2(financedCapital + openingFeeAmount);

  const schedule = terms.map((months) => ({
    months,
    monthlyPayment: computeMonthlyInstallment(capitalWithFee, cleanTin, months),
    totalPayable: round2(computeMonthlyInstallment(capitalWithFee, cleanTin, months) * months),
  }));

  return {
    salePrice: cleanSalePrice,
    discount: cleanDiscount,
    warranty: cleanWarranty,
    downPayment: cleanDownPayment,
    offerTotal,
    financedCapital,
    openingFeeAmount,
    capitalWithFee,
    annualTinPercent: cleanTin,
    openingFeePercent: cleanFee,
    schedule,
  };
}

export function formatEuro(amount) {
  const value = round2(Number.isFinite(Number(amount)) ? Number(amount) : 0);
  const fixed = value.toFixed(2);
  const [rawInt, decPart] = fixed.split('.');
  const isNegative = rawInt.startsWith('-');
  const digits = isNegative ? rawInt.slice(1) : rawInt;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}${grouped},${decPart} €`;
}
