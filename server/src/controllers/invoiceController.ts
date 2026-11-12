import { Request, Response } from 'express';
import fs from 'fs';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { BusinessSettings } from '../models/BusinessSettings.js';
import { calculateInvoice } from '../services/calculationService.js';
import { getNextInvoiceNumber } from '../services/invoiceNumberService.js';
import { generateInvoicePdf } from '../services/pdfService.js';
import { logAudit } from '../services/auditService.js';
import { logger } from '../utils/logger.js';

export async function createInvoice(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const body = req.body;

  const settings = await BusinessSettings.findOne().lean();
  const isGstEnabled = settings?.isGstEnabled ?? true;

  // Recalculate totals on backend
  const calculated = calculateInvoice(
    body.items,
    body.isInterState,
    isGstEnabled,
    body.amountPaid || 0
  );

  // Generate atomic invoice number
  const invoiceNumber = await getNextInvoiceNumber(body.date);

  const invoice = new Invoice({
    invoiceNumber,
    date: body.date,
    dueDate: body.dueDate || undefined,
    placeOfSupply: body.placeOfSupply || 'Gujarat (24)',
    isInterState: body.isInterState || false,
    customer: body.customer,
    items: calculated.items,
    subtotal: calculated.subtotal,
    totalDiscount: calculated.totalDiscount,
    taxableAmount: calculated.taxableAmount,
    totalCgst: calculated.totalCgst,
    totalSgst: calculated.totalSgst,
    totalIgst: calculated.totalIgst,
    totalTax: calculated.totalTax,
    roundOff: calculated.roundOff,
    grandTotal: calculated.grandTotal,
    amountPaid: body.amountPaid || 0,
    balanceDue: calculated.balanceDue,
    paymentStatus: calculated.paymentStatus,
    notes: body.notes || settings?.defaultNotes,
    terms: body.terms && body.terms.length > 0 ? body.terms : settings?.invoiceTerms,
    managerId: current.id,
    managerUsername: current.username,
    managerName: current.displayName,
    managerSignature: current.signatureImage,
    status: 'ACTIVE',
  });

  await invoice.save();

  // If there was an upfront payment, record Payment transaction
  if (body.amountPaid && body.amountPaid > 0) {
    const payment = new Payment({
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      customerId: invoice.customer.customerId,
      customerName: invoice.customer.name,
      amount: body.amountPaid,
      paymentMethod: 'CASH',
      paymentDate: body.date,
      notes: 'Initial payment at invoice creation',
      recordedBy: {
        id: current.id,
        username: current.username,
        displayName: current.displayName,
      },
    });
    await payment.save();
  }

  // Generate PDF
  try {
    const { pdfPath, pdfUrl } = await generateInvoicePdf(invoice);
    invoice.pdfPath = pdfPath;
    invoice.pdfUrl = pdfUrl;
    await invoice.save();
  } catch (pdfErr) {
    logger.warn({ err: pdfErr }, 'PDF generation delayed or failed on creation; will generate on demand');
  }

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'CREATE_INVOICE',
    entityType: 'INVOICE',
    entityId: invoice._id.toString(),
    details: {
      invoiceNumber: invoice.invoiceNumber,
      grandTotal: invoice.grandTotal,
      customer: invoice.customer.name,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: `Invoice ${invoice.invoiceNumber} created successfully`,
    data: invoice,
  });
}

export async function getInvoices(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const search = (req.query.search as string || '').trim();
  const paymentStatus = (req.query.paymentStatus as string || '').trim();
  const startDate = (req.query.startDate as string || '').trim();
  const endDate = (req.query.endDate as string || '').trim();
  const manager = (req.query.manager as string || '').trim();
  const skip = (page - 1) * limit;

  const query: any = { status: 'ACTIVE' };

  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.mobile': { $regex: search, $options: 'i' } },
    ];
  }
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }
  if (manager) {
    query.managerUsername = manager.toLowerCase();
  }
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  const [invoices, total] = await Promise.all([
    Invoice.find(query).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Invoice.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getInvoiceById(req: Request, res: Response): Promise<void> {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404).json({ success: false, error: 'Invoice not found' });
    return;
  }

  const payments = await Payment.find({ invoiceId: invoice._id }).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    data: {
      ...invoice.toObject(),
      payments,
    },
  });
}

export async function updateInvoice(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404).json({ success: false, error: 'Invoice not found' });
    return;
  }

  const body = req.body;
  const settings = await BusinessSettings.findOne().lean();
  const isGstEnabled = settings?.isGstEnabled ?? true;

  // Recalculate totals
  const calculated = calculateInvoice(
    body.items,
    body.isInterState,
    isGstEnabled,
    body.amountPaid !== undefined ? body.amountPaid : invoice.amountPaid
  );

  // Preserve invoice number & manager attribution
  invoice.date = body.date || invoice.date;
  invoice.dueDate = body.dueDate !== undefined ? body.dueDate : invoice.dueDate;
  invoice.placeOfSupply = body.placeOfSupply || invoice.placeOfSupply;
  invoice.isInterState = body.isInterState ?? invoice.isInterState;
  invoice.customer = body.customer || invoice.customer;
  invoice.items = calculated.items as any;
  invoice.subtotal = calculated.subtotal;
  invoice.totalDiscount = calculated.totalDiscount;
  invoice.taxableAmount = calculated.taxableAmount;
  invoice.totalCgst = calculated.totalCgst;
  invoice.totalSgst = calculated.totalSgst;
  invoice.totalIgst = calculated.totalIgst;
  invoice.totalTax = calculated.totalTax;
  invoice.roundOff = calculated.roundOff;
  invoice.grandTotal = calculated.grandTotal;
  if (body.amountPaid !== undefined) {
    invoice.amountPaid = body.amountPaid;
  }
  invoice.balanceDue = calculated.balanceDue;
  invoice.paymentStatus = calculated.paymentStatus;
  if (body.notes !== undefined) invoice.notes = body.notes;
  if (body.terms) invoice.terms = body.terms;

  await invoice.save();

  // Regenerate PDF
  try {
    const { pdfPath, pdfUrl } = await generateInvoicePdf(invoice);
    invoice.pdfPath = pdfPath;
    invoice.pdfUrl = pdfUrl;
    await invoice.save();
  } catch (err) {
    logger.warn({ err }, 'PDF re-generation error on invoice update');
  }

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'UPDATE_INVOICE',
    entityType: 'INVOICE',
    entityId: invoice._id.toString(),
    details: { invoiceNumber: invoice.invoiceNumber, grandTotal: invoice.grandTotal },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: `Invoice ${invoice.invoiceNumber} updated successfully`,
    data: invoice,
  });
}

export async function deleteInvoice(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const invoice = await Invoice.findByIdAndUpdate(
    req.params.id,
    { status: 'ARCHIVED' },
    { new: true }
  );

  if (!invoice) {
    res.status(404).json({ success: false, error: 'Invoice not found' });
    return;
  }

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'ARCHIVE_INVOICE',
    entityType: 'INVOICE',
    entityId: invoice._id.toString(),
    details: { invoiceNumber: invoice.invoiceNumber },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: `Invoice ${invoice.invoiceNumber} archived successfully`,
  });
}

export async function getInvoicePdf(req: Request, res: Response): Promise<void> {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404).json({ success: false, error: 'Invoice not found' });
    return;
  }

  let filePath = invoice.pdfPath;
  if (!filePath || !fs.existsSync(filePath)) {
    try {
      const generated = await generateInvoicePdf(invoice);
      invoice.pdfPath = generated.pdfPath;
      invoice.pdfUrl = generated.pdfUrl;
      await invoice.save();
      filePath = generated.pdfPath;
    } catch (e) {
      res.status(500).json({ success: false, error: 'Failed to generate PDF document' });
      return;
    }
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${invoice.invoiceNumber}.pdf"`
  );

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
}

export async function regenerateInvoicePdf(req: Request, res: Response): Promise<void> {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404).json({ success: false, error: 'Invoice not found' });
    return;
  }

  const { pdfPath, pdfUrl } = await generateInvoicePdf(invoice);
  invoice.pdfPath = pdfPath;
  invoice.pdfUrl = pdfUrl;
  await invoice.save();

  res.json({
    success: true,
    message: 'PDF regenerated successfully',
    data: { pdfPath, pdfUrl },
  });
}
