import { Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { Customer } from '../models/Customer.js';
import { Payment } from '../models/Payment.js';

export async function getDashboardSummary(req: Request, res: Response): Promise<void> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const thisMonthPrefix = `${currentYear}-${currentMonth}`;

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonthStr = String(lastMonthDate.getMonth() + 1).padStart(2, '0');
  const lastMonthPrefix = `${lastMonthYear}-${lastMonthStr}`;

  // 1. KPI aggregations from real Invoice data
  const [
    invoiceStats,
    thisMonthStats,
    lastMonthStats,
    totalCustomers,
    recentInvoices,
    recentPayments,
  ] = await Promise.all([
    // All-time invoice stats
    Invoice.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$grandTotal' },
          paidInvoices: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, 1, 0] },
          },
          unpaidInvoices: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'UNPAID'] }, 1, 0] },
          },
          partialInvoices: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'PARTIAL'] }, 1, 0] },
          },
          outstandingAmount: { $sum: '$balanceDue' },
        },
      },
    ]),

    // This month stats
    Invoice.aggregate([
      { $match: { status: 'ACTIVE', date: { $regex: `^${thisMonthPrefix}` } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
    ]),

    // Last month stats
    Invoice.aggregate([
      { $match: { status: 'ACTIVE', date: { $regex: `^${lastMonthPrefix}` } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
    ]),

    // Active customers count
    Customer.countDocuments({ isActive: true }),

    // Recent 5 invoices
    Invoice.find({ status: 'ACTIVE' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),

    // Recent 5 payments
    Payment.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const kpis = {
    totalInvoices: invoiceStats[0]?.totalInvoices || 0,
    totalRevenue: invoiceStats[0]?.totalRevenue || 0,
    thisMonthRevenue: thisMonthStats[0]?.revenue || 0,
    lastMonthRevenue: lastMonthStats[0]?.revenue || 0,
    totalCustomers: totalCustomers || 0,
    paidInvoices: invoiceStats[0]?.paidInvoices || 0,
    unpaidInvoices: invoiceStats[0]?.unpaidInvoices || 0,
    partialInvoices: invoiceStats[0]?.partialInvoices || 0,
    outstandingAmount: invoiceStats[0]?.outstandingAmount || 0,
  };

  // 2. Daily sales for current month
  const dailySalesAgg = await Invoice.aggregate([
    { $match: { status: 'ACTIVE', date: { $regex: `^${thisMonthPrefix}` } } },
    {
      $group: {
        _id: '$date',
        amount: { $sum: '$grandTotal' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dailySales = dailySalesAgg.map((d) => ({
    date: d._id,
    amount: d.amount,
    count: d.count,
  }));

  // 3. Monthly sales trends (last 6-12 months)
  const monthlySalesAgg = await Invoice.aggregate([
    { $match: { status: 'ACTIVE' } },
    {
      $group: {
        _id: { $substr: ['$date', 0, 7] }, // "YYYY-MM"
        revenue: { $sum: '$grandTotal' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  const monthlySales = monthlySalesAgg.map((m) => ({
    month: m._id,
    revenue: m.revenue,
    count: m.count,
  }));

  // 4. Payment method distribution
  const paymentMethodAgg = await Payment.aggregate([
    {
      $group: {
        _id: '$paymentMethod',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  const paymentMethodDistribution = paymentMethodAgg.map((p) => ({
    method: p._id,
    total: p.total,
    count: p.count,
  }));

  // 5. Top products
  const topProductsAgg = await Invoice.aggregate([
    { $match: { status: 'ACTIVE' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.totalAmount' },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  const topProducts = topProductsAgg.map((p) => ({
    name: p._id,
    quantity: p.quantity,
    revenue: p.revenue,
  }));

  res.json({
    success: true,
    data: {
      kpis,
      recentInvoices,
      recentPayments,
      dailySales,
      monthlySales,
      paymentMethodDistribution,
      topProducts,
    },
  });
}
