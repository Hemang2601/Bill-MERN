import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';

export async function getSalesReport(req: Request, res: Response): Promise<void> {
  const { startDate, endDate, groupBy = 'daily' } = req.query;

  const match: any = { status: 'ACTIVE' };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = startDate;
    if (endDate) match.date.$lte = endDate;
  }

  const groupFormat =
    groupBy === 'monthly'
      ? { $substr: ['$date', 0, 7] }
      : groupBy === 'yearly'
      ? { $substr: ['$date', 0, 4] }
      : '$date';

  const report = await Invoice.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupFormat,
        totalSales: { $sum: '$grandTotal' },
        taxableAmount: { $sum: '$taxableAmount' },
        taxCollected: { $sum: '$totalTax' },
        invoiceCount: { $sum: 1 },
        amountPaid: { $sum: '$amountPaid' },
        balanceDue: { $sum: '$balanceDue' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: report.map((r) => ({
      period: r._id,
      totalSales: r.totalSales,
      taxableAmount: r.taxableAmount,
      taxCollected: r.taxCollected,
      invoiceCount: r.invoiceCount,
      amountPaid: r.amountPaid,
      balanceDue: r.balanceDue,
    })),
  });
}

export async function getCustomerWiseReport(req: Request, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  const match: any = { status: 'ACTIVE' };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = startDate;
    if (endDate) match.date.$lte = endDate;
  }

  const report = await Invoice.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$customer.name',
        mobile: { $first: '$customer.mobile' },
        invoiceCount: { $sum: 1 },
        totalSpent: { $sum: '$grandTotal' },
        totalPaid: { $sum: '$amountPaid' },
        outstanding: { $sum: '$balanceDue' },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 100 },
  ]);

  res.json({
    success: true,
    data: report.map((r) => ({
      customerName: r._id,
      mobile: r.mobile,
      invoiceCount: r.invoiceCount,
      totalSpent: r.totalSpent,
      totalPaid: r.totalPaid,
      outstanding: r.outstanding,
    })),
  });
}

export async function getProductWiseReport(req: Request, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  const match: any = { status: 'ACTIVE' };
  if (startDate || endDate) {
    match.date = {};
    if (startDate) match.date.$gte = startDate;
    if (endDate) match.date.$lte = endDate;
  }

  const report = await Invoice.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        unit: { $first: '$items.unit' },
        quantitySold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.totalAmount' },
        invoiceOccurrences: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  res.json({
    success: true,
    data: report.map((r) => ({
      productName: r._id,
      unit: r.unit,
      quantitySold: r.quantitySold,
      revenue: r.revenue,
      invoiceOccurrences: r.invoiceOccurrences,
    })),
  });
}

export async function getPaymentCollectionReport(req: Request, res: Response): Promise<void> {
  const { startDate, endDate } = req.query;
  const match: any = {};
  if (startDate || endDate) {
    match.paymentDate = {};
    if (startDate) match.paymentDate.$gte = startDate;
    if (endDate) match.paymentDate.$lte = endDate;
  }

  const report = await Payment.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$paymentMethod',
        totalCollected: { $sum: '$amount' },
        transactionsCount: { $sum: 1 },
      },
    },
    { $sort: { totalCollected: -1 } },
  ]);

  res.json({
    success: true,
    data: report.map((r) => ({
      paymentMethod: r._id,
      totalCollected: r.totalCollected,
      transactionsCount: r.transactionsCount,
    })),
  });
}

export async function exportInvoicesCsv(req: Request, res: Response): Promise<void> {
  const invoices = await Invoice.find({ status: 'ACTIVE' }).sort({ date: -1 }).lean();

  const headers = [
    'Invoice Number',
    'Date',
    'Customer Name',
    'Mobile',
    'GSTIN',
    'Subtotal',
    'Discount',
    'Taxable',
    'CGST',
    'SGST',
    'IGST',
    'Grand Total',
    'Amount Paid',
    'Balance Due',
    'Payment Status',
    'Manager',
  ];

  const rows = invoices.map((inv) => [
    `"${inv.invoiceNumber}"`,
    `"${inv.date}"`,
    `"${inv.customer.name.replace(/"/g, '""')}"`,
    `"${inv.customer.mobile}"`,
    `"${inv.customer.gstin || ''}"`,
    inv.subtotal.toFixed(2),
    inv.totalDiscount.toFixed(2),
    inv.taxableAmount.toFixed(2),
    inv.totalCgst.toFixed(2),
    inv.totalSgst.toFixed(2),
    inv.totalIgst.toFixed(2),
    inv.grandTotal.toFixed(2),
    inv.amountPaid.toFixed(2),
    inv.balanceDue.toFixed(2),
    `"${inv.paymentStatus}"`,
    `"${inv.managerName}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="shree-shakti-invoices.csv"');
  res.send(csv);
}
