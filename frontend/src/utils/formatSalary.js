export const formatSalary = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
