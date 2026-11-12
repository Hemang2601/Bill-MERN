const units = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertThreeDigits(n: number): string {
  let res = '';
  if (n >= 100) {
    res += `${units[Math.floor(n / 100)]} Hundred `;
    n %= 100;
  }
  if (n >= 20) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (u > 0) {
      res += `${tens[t]}-${units[u]} `;
    } else {
      res += `${tens[t]} `;
    }
    n = 0;
  }
  if (n > 0) {
    res += `${units[n]} `;
  }
  return res.trim();
}

/**
 * Converts a numeric amount into Indian Currency Words.
 * E.g. 15420.50 => "Rupees Fifteen Thousand Four Hundred Twenty and Fifty Paise Only."
 */
export function amountInWords(amount: number): string {
  if (amount <= 0 || isNaN(amount)) return 'Rupees Zero Only.';

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let temp = rupees;
  let words = '';

  // Crores (>= 1,00,00,000)
  if (temp >= 10000000) {
    const crore = Math.floor(temp / 10000000);
    words += `${convertThreeDigits(crore)} Crore `;
    temp %= 10000000;
  }

  // Lakhs (>= 1,00,000)
  if (temp >= 100000) {
    const lakh = Math.floor(temp / 100000);
    words += `${convertThreeDigits(lakh)} Lakh `;
    temp %= 100000;
  }

  // Thousands (>= 1,000)
  if (temp >= 1000) {
    const thousand = Math.floor(temp / 1000);
    words += `${convertThreeDigits(thousand)} Thousand `;
    temp %= 1000;
  }

  // Hundreds and below
  if (temp > 0) {
    words += `${convertThreeDigits(temp)} `;
  }

  words = words.trim();
  if (!words) {
    words = 'Zero';
  }

  let result = `Rupees ${words}`;
  if (paise > 0) {
    result += ` and ${convertThreeDigits(paise)} Paise Only.`;
  } else {
    result += ' Only.';
  }

  return result;
}

/**
 * Formats a number to Indian currency format (e.g. ₹ 1,23,456.00)
 */
export function formatINR(val: number): string {
  if (isNaN(val)) return '₹ 0.00';
  const parts = Number(val).toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  const isNegative = integerPart.startsWith('-');
  if (isNegative) integerPart = integerPart.substring(1);

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  return `${isNegative ? '-' : ''}₹ ${formattedInteger}.${decimalPart}`;
}
