export const formatCurrency = (value:number) => {
  if (isNaN(value)) return '0.00';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 });
}

export const NumberFormatCurrency = (number: number | string, currency: string = 'USD', fractionDigits = 2): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(
    Number(number)
  ).replace('NIO ', 'C$')
}