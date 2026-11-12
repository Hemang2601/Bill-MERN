import { InvoiceItem, PaymentStatus } from '../types';

export function roundToPaise(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export interface ClientCalculatedInvoice {
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

export function calculateClientInvoice(
  rawItems: any[],
  isInterState: boolean = false,
  isGstEnabled: boolean = true,
  amountPaid: number = 0
): ClientCalculatedInvoice {
  let totalGross = 0;
  let totalDiscount = 0;
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const calculatedItems: InvoiceItem[] = rawItems.map((item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.rate) || 0;
    const grossAmount = roundToPaise(qty * rate);
    totalGross = roundToPaise(totalGross + grossAmount);

    let discPercent = Number(item.discountPercent || 0);
    if (discPercent < 0) discPercent = 0;
    if (discPercent > 100) discPercent = 100;

    let itemDiscount = 0;
    if (item.discountAmount !== undefined && Number(item.discountAmount) > 0) {
      itemDiscount = roundToPaise(Math.min(grossAmount, Number(item.discountAmount)));
    } else if (discPercent > 0) {
      itemDiscount = roundToPaise((grossAmount * discPercent) / 100);
    }
    totalDiscount = roundToPaise(totalDiscount + itemDiscount);

    const taxable = roundToPaise(grossAmount - itemDiscount);
    totalTaxable = roundToPaise(totalTaxable + taxable);

    let effectiveGstRate = isGstEnabled ? Number(item.gstRate ?? 18) : 0;
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
      _id: item._id,
      productId: item.productId,
      name: (item.name || '').trim(),
      description: item.description?.trim(),
      hsn: item.hsn?.trim(),
      quantity: qty,
      unit: item.unit || 'Nos',
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
