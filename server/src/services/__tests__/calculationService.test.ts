import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateInvoice } from '../calculationService.js';
import { amountInWords, formatINR } from '../../utils/amountInWords.js';

describe('Indian Billing Calculation Engine', () => {
  it('correctly calculates intra-state GST (CGST + SGST) for multiple electrical items', () => {
    const items = [
      {
        name: 'Switch 6A 1-Way',
        quantity: 10,
        rate: 50, // 500
        gstRate: 18,
      },
      {
        name: 'Socket 6A 3-Pin',
        quantity: 5,
        rate: 100, // 500
        gstRate: 18,
      },
    ];

    // Gross = 1000. CGST 9% = 90, SGST 9% = 90, Total Tax = 180, Grand Total = 1180
    const result = calculateInvoice(items, false, true, 0);

    assert.equal(result.subtotal, 1000);
    assert.equal(result.taxableAmount, 1000);
    assert.equal(result.totalCgst, 90);
    assert.equal(result.totalSgst, 90);
    assert.equal(result.totalIgst, 0);
    assert.equal(result.totalTax, 180);
    assert.equal(result.grandTotal, 1180);
    assert.equal(result.balanceDue, 1180);
    assert.equal(result.paymentStatus, 'UNPAID');
  });

  it('correctly calculates inter-state IGST', () => {
    const items = [
      {
        name: 'LED Batten 20W',
        quantity: 10,
        rate: 250, // 2500
        gstRate: 12,
      },
    ];

    // IGST 12% on 2500 = 300
    const result = calculateInvoice(items, true, true, 2800);

    assert.equal(result.subtotal, 2500);
    assert.equal(result.totalCgst, 0);
    assert.equal(result.totalSgst, 0);
    assert.equal(result.totalIgst, 300);
    assert.equal(result.totalTax, 300);
    assert.equal(result.grandTotal, 2800);
    assert.equal(result.balanceDue, 0);
    assert.equal(result.paymentStatus, 'PAID');
  });

  it('handles item discounts accurately and prevents negative totals', () => {
    const items = [
      {
        name: '1.5mm Wire Coil',
        quantity: 2,
        rate: 2000, // 4000
        discountPercent: 10, // 400 discount -> taxable 3600
        gstRate: 18, // 18% on 3600 = 648
      },
    ];

    const result = calculateInvoice(items, false, true, 1000);

    assert.equal(result.subtotal, 4000);
    assert.equal(result.totalDiscount, 400);
    assert.equal(result.taxableAmount, 3600);
    assert.equal(result.totalTax, 648);
    assert.equal(result.grandTotal, 4248);
    assert.equal(result.balanceDue, 3248);
    assert.equal(result.paymentStatus, 'PARTIAL');
  });

  it('handles non-GST billing accurately when GST is disabled', () => {
    const items = [
      {
        name: 'Labor charges',
        quantity: 1,
        rate: 750,
        gstRate: 18,
      },
    ];

    const result = calculateInvoice(items, false, false, 750);

    assert.equal(result.subtotal, 750);
    assert.equal(result.totalTax, 0);
    assert.equal(result.grandTotal, 750);
    assert.equal(result.balanceDue, 0);
    assert.equal(result.paymentStatus, 'PAID');
  });

  it('converts numerical amounts to Indian currency words accurately', () => {
    assert.equal(amountInWords(0), 'Rupees Zero Only.');
    assert.equal(amountInWords(540), 'Rupees Five Hundred Forty Only.');
    assert.equal(amountInWords(15800), 'Rupees Fifteen Thousand Eight Hundred Only.');
    assert.equal(amountInWords(2500450), 'Rupees Twenty-Five Lakh Four Hundred Fifty Only.');
    assert.equal(amountInWords(10000000), 'Rupees One Crore Only.');
  });

  it('formats INR numbers properly', () => {
    assert.equal(formatINR(12500), '₹ 12,500.00');
    assert.equal(formatINR(1500000), '₹ 15,00,000.00');
    assert.equal(formatINR(0), '₹ 0.00');
  });
});
