import { InvoiceItem, PaymentStatus } from '../types/index.js';

export interface RawInvoiceItemInput {
  productId?: string;
  name: string;
  description?: string;
  hsn?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discountPercent?: number;
  discountAmount?: number;
  gstRate?: number;
}

export interface CalculatedInvoiceResult {
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  roundOff: number;
  grandTotal: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
}

/**
 * Rounds to 2 decimal places using integer paise arithmetic to avoid floating-point errors
 */
export function roundToPaise(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Robust, deterministic calculation engine for Indian GST & Billing
 */
export function calculateInvoice(
  rawItems: RawInvoiceItemInput[],
  isInterState: boolean = false,
  isGstEnabled: boolean = true,
  amountPaid: number = 0
): CalculatedInvoiceResult {
  if (!rawItems || rawItems.length === 0) {
    throw new Error('At least one item is required in the invoice');
  }

  let totalGross = 0;
  let totalDiscount = 0;
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const calculatedItems: InvoiceItem[] = rawItems.map((item, idx) => {
    const qty = Number(item.quantity);
    const rate = Number(item.rate);

    if (isNaN(qty) || qty <= 0) {
      throw new Error(`Item #${idx + 1} (${item.name || 'unnamed'}): Quantity must be greater than zero`);
    }
    if (isNaN(rate) || rate < 0) {
      throw new Error(`Item #${idx + 1} (${item.name || 'unnamed'}): Rate cannot be negative`);
    }

    const grossAmount = roundToPaise(qty * rate);
    totalGross = roundToPaise(totalGross + grossAmount);

    let discPercent = Number(item.discountPercent || 0);
    if (discPercent < 0) discPercent = 0;
    if (discPercent > 100) discPercent = 100;

    let itemDiscount = 0;
    if (item.discountAmount !== undefined && item.discountAmount > 0) {
      itemDiscount = roundToPaise(Math.min(grossAmount, Number(item.discountAmount)));
    } else if (discPercent > 0) {
      itemDiscount = roundToPaise((grossAmount * discPercent) / 100);
    }
    totalDiscount = roundToPaise(totalDiscount + itemDiscount);

    const taxable = roundToPaise(grossAmount - itemDiscount);
    totalTaxable = roundToPaise(totalTaxable + taxable);

    let effectiveGstRate = isGstEnabled ? Number(item.gstRate ?? 18) : 0;
    if (isNaN(effectiveGstRate) || effectiveGstRate < 0) {
      effectiveGstRate = 0;
    }

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isGstEnabled && effectiveGstRate > 0) {
      if (isInterState) {
        igst = roundToPaise((taxable * effectiveGstRate) / 100);
        totalIgst = roundToPaise(totalIgst + igst);
      } else {
        const halfRate = effectiveGstRate / 2;
        cgst = roundToPaise((taxable * halfRate) / 100);
        sgst = roundToPaise((taxable * halfRate) / 100);
        totalCgst = roundToPaise(totalCgst + cgst);
        totalSgst = roundToPaise(totalSgst + sgst);
      }
    }

    const itemTotal = roundToPaise(taxable + cgst + sgst + igst);

    return {
      productId: item.productId,
      name: item.name.trim(),
      description: item.description?.trim(),
      hsn: item.hsn?.trim(),
      quantity: qty,
      unit: (item.unit || 'Nos') as any,
      rate: rate,
      discountPercent: discPercent,
      discountAmount: itemDiscount,
      taxableAmount: taxable,
      gstRate: effectiveGstRate,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalAmount: itemTotal,
    };
  });

  const totalTax = roundToPaise(totalCgst + totalSgst + totalIgst);
  const exactGrandTotal = roundToPaise(totalTaxable + totalTax);

  // Round off to nearest rupee
  const roundedGrandTotal = Math.round(exactGrandTotal);
  const roundOff = roundToPaise(roundedGrandTotal - exactGrandTotal);

  const safePaid = Math.max(0, roundToPaise(Number(amountPaid) || 0));
  const balanceDue = Math.max(0, roundToPaise(roundedGrandTotal - safePaid));

  let paymentStatus: PaymentStatus = 'UNPAID';
  if (safePaid >= roundedGrandTotal) {
    paymentStatus = 'PAID';
  } else if (safePaid > 0) {
    paymentStatus = 'PARTIAL';
  }

  return {
    items: calculatedItems,
    subtotal: totalGross,
    totalDiscount: totalDiscount,
    taxableAmount: totalTaxable,
    totalCgst: totalCgst,
    totalSgst: totalSgst,
    totalIgst: totalIgst,
    totalTax: totalTax,
    roundOff: roundOff,
    grandTotal: roundedGrandTotal,
    balanceDue: balanceDue,
    paymentStatus: paymentStatus,
  };
}
