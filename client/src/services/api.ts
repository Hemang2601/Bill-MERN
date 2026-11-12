import axios from 'axios';
import {
  ApiResponse,
  ManagerUser,
  Customer,
  Product,
  Invoice,
  Payment,
  BusinessSettings,
  AuditLog,
  DashboardSummary,
} from '../types';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for cleaner error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

// --- AUTH API ---
export const authApi = {
  login: async (username: 'hiren' | 'suresh', password: string) => {
    const res = await apiClient.post<ApiResponse<ManagerUser>>('/auth/login', {
      username,
      password,
    });
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<ApiResponse<ManagerUser>>('/auth/me');
    return res.data;
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await apiClient.post<ApiResponse<void>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },
};

// --- CUSTOMERS API ---
export const customersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const res = await apiClient.get<ApiResponse<Customer[]>>('/customers', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Customer & { invoices: Invoice[] }>>(`/customers/${id}`);
    return res.data;
  },
  create: async (data: Partial<Customer>) => {
    const res = await apiClient.post<ApiResponse<Customer>>('/customers', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Customer>) => {
    const res = await apiClient.patch<ApiResponse<Customer>>(`/customers/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/customers/${id}`);
    return res.data;
  },
};

// --- PRODUCTS API ---
export const productsApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
    const res = await apiClient.get<ApiResponse<Product[]>>('/products', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data;
  },
  create: async (data: Partial<Product>) => {
    const res = await apiClient.post<ApiResponse<Product>>('/products', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Product>) => {
    const res = await apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/products/${id}`);
    return res.data;
  },
};

// --- INVOICES API ---
export const invoicesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    manager?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<Invoice[]>>('/invoices', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Invoice & { payments: Payment[] }>>(`/invoices/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<ApiResponse<Invoice>>('/invoices', data);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await apiClient.patch<ApiResponse<Invoice>>(`/invoices/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/invoices/${id}`);
    return res.data;
  },
  getPdfUrl: (id: string) => `/api/v1/invoices/${id}/pdf`,
  regeneratePdf: async (id: string) => {
    const res = await apiClient.post<ApiResponse<{ pdfPath: string; pdfUrl: string }>>(`/invoices/${id}/regenerate-pdf`);
    return res.data;
  },
};

// --- PAYMENTS API ---
export const paymentsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    invoiceId?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const res = await apiClient.get<ApiResponse<Payment[]>>('/payments', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return res.data;
  },
  create: async (data: {
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    paymentDate: string;
    notes?: string;
  }) => {
    const res = await apiClient.post<ApiResponse<Payment>>('/payments', data);
    return res.data;
  },
};

// --- DASHBOARD API ---
export const dashboardApi = {
  getSummary: async () => {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return res.data;
  },
};

// --- REPORTS API ---
export const reportsApi = {
  getSales: async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/reports/sales', { params });
    return res.data;
  },
  getCustomers: async (params?: { startDate?: string; endDate?: string }) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/reports/customers', { params });
    return res.data;
  },
  getProducts: async (params?: { startDate?: string; endDate?: string }) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/reports/products', { params });
    return res.data;
  },
  getPayments: async (params?: { startDate?: string; endDate?: string }) => {
    const res = await apiClient.get<ApiResponse<any[]>>('/reports/payments', { params });
    return res.data;
  },
  getExportCsvUrl: () => '/api/v1/reports/export-csv',
};

// --- SETTINGS API ---
export const settingsApi = {
  getBusiness: async () => {
    const res = await apiClient.get<ApiResponse<BusinessSettings>>('/settings/business');
    return res.data;
  },
  updateBusiness: async (data: Partial<BusinessSettings>) => {
    const res = await apiClient.patch<ApiResponse<BusinessSettings>>('/settings/business', data);
    return res.data;
  },
};

// --- AUDIT API ---
export const auditApi = {
  getLogs: async (params?: { page?: number; limit?: number; manager?: string; action?: string }) => {
    const res = await apiClient.get<ApiResponse<AuditLog[]>>('/audit-logs', { params });
    return res.data;
  },
};
