
import { getProfile } from './auth';

export function formatCurrency(amount: number) {
  const profile = getProfile();
  const currency = profile?.preferences?.currency || 'INR';
  
  let locale = 'en-IN';
  if (currency === 'USD') {
    locale = 'en-US';
  } else if (currency === 'EUR') {
    locale = 'de-DE'; // Example locale for Euro
  }
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch (error) {
    console.error("Currency formatting failed:", error);
    // Fallback to a simple format
    return `${currency} ${amount.toFixed(2)}`;
  }
}
