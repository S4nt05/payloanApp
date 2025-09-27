export const formatCurrency = (value:number) => {
  if (isNaN(value)) return '0.00';
  return Number(value).toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 });
}