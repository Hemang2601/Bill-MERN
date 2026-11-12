export type ManagerUsername = 'hiren' | 'suresh';

export interface ManagerUser {
  id: string;
  username: ManagerUsername;
  displayName: string;
  signatureImage: string;
  role: 'manager';
  phone?: string;
  email?: string;
  isActive?: boolean;
  lastLogin?: string;
}

export interface Customer {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  billingAddress?: string;
  city?: string;
  state: string;
  pinCode?: string;
  gstin?: string;
  notes?: string;
  isActive: boolean;
  totalPurchases?: number;
  totalInvoicesCount?: number;
  outstandingBalance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSnapshot {
  customerId?: string;
  name: string;
  mobile: string;
  email?: string;
  billingAddress?: string;
  city?: string;
  state: string;
  pinCode?: string;
  gstin?: string;
}

export type ProductUnit = 'Nos' | 'Pcs' | 'Mtr' | 'Coil' | 'Set' | 'Box' | 'Pkt';

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  description?: string;
  category: string;
  unit: ProductUnit;
  sellingPrice: number;
  purchasePrice?: number;
  taxRate: number;
  hsn?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  _id?: string;
  productId?: string;
  name: string;
  description?: string;
  hsn?: string;
  quantity: number;
  unit: ProductUnit;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
}

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
export type PaymentMethod = 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  placeOfSupply: string;
  isInterState: boolean;
  customer: CustomerSnapshot;
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
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  terms?: string[];
  managerId: string;
  managerUsername: ManagerUsername;
  managerName: string;
  managerSignature: string;
  pdfPath?: string;
  pdfUrl?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
  recordedBy: {
    id: string;
    username: ManagerUsername;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  _id?: string;
  businessName: string;
  tagline: string;
  specialization: string;
  phone1: string;
  phone2?: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  pinCode: string;
  gstin?: string;
  pan?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  invoicePrefix: string;
  invoiceTerms: string[];
  defaultNotes?: string;
  isGstEnabled: boolean;
  defaultGstRate: number;
}

export interface AuditLog {
  _id: string;
  managerId: string;
  managerUsername: ManagerUsername;
  managerDisplayName: string;
  action: string;
  entityType: 'INVOICE' | 'PAYMENT' | 'CUSTOMER' | 'PRODUCT' | 'SETTINGS' | 'AUTH';
  entityId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardSummary {
  kpis: {
    totalInvoices: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    totalCustomers: number;
    paidInvoices: number;
    unpaidInvoices: number;
    partialInvoices: number;
    outstandingAmount: number;
  };
  recentInvoices: Invoice[];
  recentPayments: Payment[];
  dailySales: { date: string; amount: number; count: number }[];
  monthlySales: { month: string; revenue: number; count: number }[];
  paymentMethodDistribution: { method: string; total: number; count: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
