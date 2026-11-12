import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { customersApi } from '../../services/api';
import { Customer } from '../../types';
import { formatINR, formatDate } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const CustomerListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    billingAddress: '',
    city: 'Rajkot',
    state: 'Gujarat',
    pinCode: '',
    gstin: '',
    notes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Customers
  const { data, isLoading } = useQuery({
    queryKey: ['customers', { page, search }],
    queryFn: () => customersApi.getAll({ page, limit: 20, search }),
  });

  // Fetch Selected Customer Details (for drawer)
  const { data: customerDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['customerDetails', selectedCustomerId],
    queryFn: () => customersApi.getById(selectedCustomerId!),
    enabled: !!selectedCustomerId,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => setFormError(err.message),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) =>
      customersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setEditingCustomer(null);
      resetForm();
    },
    onError: (err: any) => setFormError(err.message),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      mobile: '',
      email: '',
      billingAddress: '',
      city: 'Rajkot',
      state: 'Gujarat',
      pinCode: '',
      gstin: '',
      notes: '',
    });
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      mobile: c.mobile,
      email: c.email || '',
      billingAddress: c.billingAddress || '',
      city: c.city || 'Rajkot',
      state: c.state || 'Gujarat',
      pinCode: c.pinCode || '',
      gstin: c.gstin || '',
      notes: c.notes || '',
    });
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Customer name is required');
      return;
    }
    if (!formData.mobile.trim()) {
      setFormError('Mobile phone number is required');
      return;
    }

    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (c: Customer) => {
    if (confirm(`Are you sure you want to archive customer "${c.name}"?`)) {
      deleteMutation.mutate(c._id);
    }
  };

  const customers = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Customer Directory
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Manage client profiles, historical billing data, and outstanding balances
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add New Customer
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by client name, mobile number, city, or GSTIN..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#E8ECF3] rounded-lg text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
          />
        </div>
      </Card>

      {/* Customer List Table */}
      <Card className="overflow-hidden p-0 border border-[#E8ECF3]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-[#64748B] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">GSTIN</th>
                <th className="py-3 px-4 text-right">Total Purchases</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF3]">
              {customers.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#111827]">{c.name}</div>
                    {c.notes && (
                      <div className="text-[10px] text-slate-400 italic truncate max-w-[150px]">
                        {c.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 space-y-0.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.mobile}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.city || 'Rajkot'}, {c.state || 'Gujarat'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {c.gstin || '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#111827]">
                    {formatINR(c.totalPurchases || 0)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span
                      className={
                        (c.outstandingBalance || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }
                    >
                      {formatINR(c.outstandingBalance || 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setSelectedCustomerId(c._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                        title="View Purchase History"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Archive Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-600">No customers found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add your first customer to get started.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-[#E8ECF3] bg-[#F8FAFC] text-xs">
            <span className="text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} clients)
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddOpen || !!editingCustomer}
        onClose={() => {
          setIsAddOpen(false);
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
        description="Enter customer contact details, tax identification, and billing address."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name or Business Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Patel Enterprise or Rajesh Mehta"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mobile Number"
              required
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="e.g. +91 98250 12345"
            />
            <Input
              label="Email Address (Optional)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. client@example.com"
            />
          </div>

          <Input
            label="Billing Address"
            value={formData.billingAddress}
            onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
            placeholder="e.g. Shop 42, GIDC Industrial Estate"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="PIN Code"
              value={formData.pinCode}
              onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
              placeholder="360001"
            />
          </div>

          <Input
            label="GSTIN Number (Optional)"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
            placeholder="e.g. 24AAAPS1234F1Z5"
          />

          <Input
            label="Notes / Remarks"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Preferred delivery time or credit terms"
          />

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E8ECF3]">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setEditingCustomer(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Details & History Modal */}
      <Modal
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        title="Customer History & Profile"
        description="Comprehensive purchase summary and past issued tax invoices"
        maxWidth="2xl"
      >
        {detailsLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          </div>
        ) : customerDetails?.data ? (
          <div className="space-y-6">
            {/* Quick Profile Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border border-[#E8ECF3] rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Client Name</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{customerDetails.data.name}</p>
                <p className="text-xs text-slate-500">{customerDetails.data.mobile}</p>
              </div>
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                <span className="text-[10px] text-blue-600 uppercase font-bold">Total Purchases</span>
                <p className="text-lg font-black text-[#2563EB] mt-0.5">
                  {formatINR(customerDetails.data.totalPurchases)}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  Across {customerDetails.data.totalInvoicesCount} invoices
                </p>
              </div>
              <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
                <span className="text-[10px] text-rose-600 uppercase font-bold">Outstanding Balance</span>
                <p className="text-lg font-black text-rose-600 mt-0.5">
                  {formatINR(customerDetails.data.outstandingBalance)}
                </p>
                <p className="text-xs text-rose-500">Unsettled credit amount</p>
              </div>
            </div>

            {/* Invoices List */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Invoices History ({customerDetails.data.invoices?.length || 0})
              </h4>
              <div className="border border-[#E8ECF3] rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-slate-500 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Total</th>
                      <th className="py-2.5 px-3">Paid</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8ECF3]">
                    {customerDetails.data.invoices?.map((inv: any) => (
                      <tr key={inv._id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-[#2563EB]">{inv.invoiceNumber}</td>
                        <td className="py-2 px-3 text-slate-600">{formatDate(inv.date)}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{formatINR(inv.grandTotal)}</td>
                        <td className="py-2 px-3 text-emerald-600 font-semibold">{formatINR(inv.amountPaid)}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {inv.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!customerDetails.data.invoices || customerDetails.data.invoices.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No invoices issued for this customer yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
