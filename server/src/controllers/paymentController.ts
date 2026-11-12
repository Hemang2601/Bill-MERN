import { Request, Response } from 'express';
import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { roundToPaise } from '../services/calculationService.js';
import { logAudit } from '../services/auditService.js';

export async function createPayment(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const { invoiceId, amount, paymentMethod, referenceNumber, paymentDate, notes } = req.body;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    res.status(404).json({ success: false, error: 'Invoice not found' });
    return;
  }

  const payAmount = roundToPaise(amount);
  if (payAmount > invoice.balanceDue) {
    res.status(400).json({
      success: false,
      error: `Payment amount (₹${payAmount}) exceeds invoice balance due (₹${invoice.balanceDue})`,
    });
    return;
  }

  const payment = new Payment({
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    customerId: invoice.customer.customerId,
    customerName: invoice.customer.name,
    amount: payAmount,
    paymentMethod,
    referenceNumber,
    paymentDate,
    notes,
    recordedBy: {
      id: current.id,
      username: current.username,
      displayName: current.displayName,
    },
  });

  await payment.save();

  // Update invoice balance
  invoice.amountPaid = roundToPaise(invoice.amountPaid + payAmount);
  invoice.balanceDue = roundToPaise(Math.max(0, invoice.grandTotal - invoice.amountPaid));

  if (invoice.balanceDue === 0) {
    invoice.paymentStatus = 'PAID';
  } else if (invoice.amountPaid > 0) {
    invoice.paymentStatus = 'PARTIAL';
  }
  await invoice.save();

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'RECORD_PAYMENT',
    entityType: 'PAYMENT',
    entityId: payment._id.toString(),
    details: {
      invoiceNumber: invoice.invoiceNumber,
      amount: payAmount,
      method: paymentMethod,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: `Payment of ₹${payAmount} recorded for invoice ${invoice.invoiceNumber}`,
    data: payment,
  });
}

export async function getPayments(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const invoiceId = req.query.invoiceId as string;
  const paymentMethod = req.query.paymentMethod as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (invoiceId) query.invoiceId = invoiceId;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    query.paymentDate = {};
    if (startDate) query.paymentDate.$gte = startDate;
    if (endDate) query.paymentDate.$lte = endDate;
  }

  const [payments, total] = await Promise.all([
    Payment.find(query).sort({ paymentDate: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Payment.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getPaymentById(req: Request, res: Response): Promise<void> {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    res.status(404).json({ success: false, error: 'Payment not found' });
    return;
  }

  res.json({
    success: true,
    data: payment,
  });
}
