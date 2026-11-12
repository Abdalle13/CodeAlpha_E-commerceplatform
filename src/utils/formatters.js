/**
 * Formats a numeric price into USD currency string ($XX.XX)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

/**
 * Formats a date into a clean editorial string
 * @param {string|Date} dateString
 * @param {boolean} includeTime
 * @returns {string}
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Formats and validates Somali phone numbers (+252 ...)
 * Typical Somali mobile prefixes: 61 (Hormuud/EVC), 62 (Somnet), 63 (Telesom/ZAAD), 68 (Amal), 69 (Golis)
 * @param {string} phone
 * @returns {{ isValid: boolean, formatted: string, provider: string }}
 */
export function formatSomaliPhone(phone) {
  if (!phone) return { isValid: false, formatted: '', provider: 'Unknown' };
  
  // Strip non-digits
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 252, keep it; if starts with 0, replace 0 with 252; if 9 digits starting with 6, prepend 252
  if (cleaned.startsWith('252')) {
    // Already has country code
  } else if (cleaned.startsWith('0')) {
    cleaned = '252' + cleaned.substring(1);
  } else if (cleaned.length === 9 && cleaned.startsWith('6')) {
    cleaned = '252' + cleaned;
  }

  const isValid = /^252[6-7]\d{7,8}$/.test(cleaned);
  
  let provider = 'Mobile Money';
  if (cleaned.startsWith('25261')) provider = 'EVC Plus (Hormuud)';
  else if (cleaned.startsWith('25263')) provider = 'ZAAD / eDahab (Telesom)';
  else if (cleaned.startsWith('25262')) provider = 'Somnet';
  else if (cleaned.startsWith('25268')) provider = 'Amal Express';
  else if (cleaned.startsWith('25269')) provider = 'Sahal (Golis)';

  const formatted = cleaned.length >= 11
    ? `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`
    : `+${cleaned}`;

  return { isValid, formatted, raw: cleaned, provider };
}

