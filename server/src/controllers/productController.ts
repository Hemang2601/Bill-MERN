import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { logAudit } from '../services/auditService.js';

export async function getProducts(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const search = (req.query.search as string || '').trim();
  const category = (req.query.category as string || '').trim();
  const skip = (page - 1) * limit;

  const query: any = { isActive: true };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { hsn: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) {
    query.category = category;
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  res.json({
    success: true,
    data: product,
  });
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const product = new Product(req.body);
  await product.save();

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'CREATE_PRODUCT',
    entityType: 'PRODUCT',
    entityId: product._id.toString(),
    details: { name: product.name, price: product.sellingPrice },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(201).json({
    success: true,
    message: 'Product added successfully',
    data: product,
  });
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'UPDATE_PRODUCT',
    entityType: 'PRODUCT',
    entityId: product._id.toString(),
    details: { name: product.name, price: product.sellingPrice },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const current = req.session.manager!;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  await logAudit({
    managerId: current.id,
    managerUsername: current.username,
    managerDisplayName: current.displayName,
    action: 'DEACTIVATE_PRODUCT',
    entityType: 'PRODUCT',
    entityId: product._id.toString(),
    details: { name: product.name },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: 'Product deactivated successfully',
  });
}
