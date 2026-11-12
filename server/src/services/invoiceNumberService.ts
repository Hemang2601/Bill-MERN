import { Counter } from '../models/Counter.js';
import { BusinessSettings } from '../models/BusinessSettings.js';

/**
 * Generates the next sequential invoice number atomically.
 * Format: SE-yyMM-XXX (e.g. SE-2611-001)
 * Concurrency-safe across both managers via MongoDB atomic findOneAndUpdate.
 */
export async function getNextInvoiceNumber(dateString?: string): Promise<string> {
  const d = dateString ? new Date(dateString) : new Date();
  const yearShort = String(d.getFullYear()).slice(-2); // e.g. "26"
  const monthStr = String(d.getMonth() + 1).padStart(2, '0'); // e.g. "11"
  const periodKey = `${yearShort}${monthStr}`; // "2611"

  const counterKey = `invoice_seq_${periodKey}`;

  // Atomic increment in MongoDB
  const counterDoc = await Counter.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = counterDoc?.seq || 1;
  const seqPadded = String(seq).padStart(3, '0');

  // Fetch configured prefix (default "SE")
  let prefix = 'SE';
  try {
    const settings = await BusinessSettings.findOne().lean();
    if (settings?.invoicePrefix) {
      prefix = settings.invoicePrefix.trim();
    }
  } catch {
    // fallback to 'SE'
  }

  return `${prefix}-${periodKey}-${seqPadded}`;
}
