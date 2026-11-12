import { Request, Response } from 'express';
import { Customer } from '../models/Customer.js';
import { Invoice } from '../models/Invoice.js';
import { logAudit } from '../services/auditService.js';

export async function getCustomers(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const search = (req.query.search as string || '').trim();
  const skip = (page - 1) * limit;

  const query: any = { isActive: true };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { gstin: { $regex: search, $options: 'i' } },
    ];
  }

  const [customers, total] = await Promise.all([
    Customer.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Customer.countDocuments(query),
  ]);

  // Aggregate purchase statistics per customer
  const customerIds = customers.map((c) => c._id);
  const invoiceStats = await Invoice.aggregate([
    {
      $match: {
        'customer.customerId': { $in: customerIds },
        status: 'ACTIVE',
      },
    },
    {
      $group: {
        _id: '$customer.customerId',
        totalPurchases: { $sum: '$grandTotal' },
        totalInvoicesCount: { $sum: 1 },
        outstandingBalance: { $sum: '$balanceDue' },
      },
    },
  ]);

  const statsMap = new Map();
  invoiceStats.forEach((s) => {
    statsMap.set(s._id.toString(), s);
  });

  const enriched = customers.map((c) => {
    const stat = statsMap.get(c._id.toString()) || {
      totalPurchases: 0,
      totalInvoicesCount: 0,
      outstandingBalance: 0,
    };
    return {
      ...c,
      totalPurchases: stat.totalPurchases,
      totalInvoicesCount: stat.totalInvoicesCount,
      outstandingBalance: stat.outstandingBalance,
    };
  });

  res.json({
    success: true,
    data: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getCustomerById(req: Request, res: Response): Promise<void> {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404).json({ success: false, error: 'Customer not found' });
    return;
  }

  const invoices = await Invoice.find({
    'customer.customerId': customer._id,
    status: 'ACTIVE',
  })
    .sort({ createdAt: -1 })
    .lean();

  const totalPurchases = invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
  const outstandingBalance = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);

  res.json({
    success: true,
    data: {
      ...customer.toObject(),
      totalPurchases,
      totalInvoicesCount: invoices.length,
      outstandingBalance,
      invoices,
    },
  });
}

export async function createCustomer(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const customer = new Customer(req.body);
  await customer.save();

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'CREATE_CUSTOMER',
    entityType: 'CUSTOMER',
    entityId: customer._id.toString(),
    details: { name: customer.name, mobile: customer.mobile },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: 'Customer added successfully',
    data: customer,
  });
}

export async function updateCustomer(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!customer) {
    res.status(404).json({ success: false, error: 'Customer not found' });
    return;
  }

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'UPDATE_CUSTOMER',
    entityType: 'CUSTOMER',
    entityId: customer._id.toString(),
    details: { name: customer.name },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Customer updated successfully',
    data: customer,
  });
}

export async function deleteCustomer(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!customer) {
    res.status(404).json({ success: false, error: 'Customer not found' });
    return;
  }

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'DEACTIVATE_CUSTOMER',
    entityType: 'CUSTOMER',
    entityId: customer._id.toString(),
    details: { name: customer.name },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Customer deactivated successfully',
  });
}
