const currencyMap: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  AED: 'د.إ',
};

export function getCurrencySymbol(code?: string | null) {
  if (!code) return '';
  const key = String(code).toUpperCase();
  return currencyMap[key] ?? code;
}

export default getCurrencySymbol;
