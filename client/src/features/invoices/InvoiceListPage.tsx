import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Calendar,
  X,
} from 'lucide-react';
import { invoicesApi, paymentsApi } from '../../services/api';
import { Invoice } from '../../types';
import { formatINR, formatDate } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [paymentStatus, setPaymentStatus] = useState<string>('ALL');
  const [managerFilter, setManagerFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Fetch Invoices
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'invoices',
      {
        page,
        search,
        paymentStatus: paymentStatus === 'ALL' ? '' : paymentStatus,
        manager: managerFilter === 'ALL' ? '' : managerFilter,
        startDate,
        endDate,
      },
    ],
    queryFn: () =>
      invoicesApi.getAll({
        page,
        limit: 25,
        search,
        paymentStatus: paymentStatus === 'ALL' ? undefined : paymentStatus,
        manager: managerFilter === 'ALL' ? undefined : managerFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  // Archive Mutation
  const archiveMutation = useMutation({
    mutationFn: invoicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    },
  });

  // Regenerate PDF Mutation
  const regenPdfMutation = useMutation({
    mutationFn: invoicesApi.regeneratePdf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  // Record Payment Mutation
  const recordPaymentMutation = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setPaymentTargetInvoice(null);
      setPaymentAmount(0);
      setPaymentRef('');
      setPaymentError(null);
    },
    onError: (err: any) => setPaymentError(err.message),
  });

  const handleOpenPayment = (inv: Invoice) => {
    setPaymentTargetInvoice(inv);
    setPaymentAmount(inv.balanceDue);
    setPaymentMethod('CASH');
    setPaymentRef('');
    setPaymentError(null);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTargetInvoice) return;
    if (paymentAmount <= 0) {
      setPaymentError('Payment amount must be greater than zero');
      return;
    }
    if (paymentAmount > paymentTargetInvoice.balanceDue) {
      setPaymentError(`Amount cannot exceed balance due (₹${paymentTargetInvoice.balanceDue})`);
      return;
    }

    recordPaymentMutation.mutate({
      invoiceId: paymentTargetInvoice._id,
      amount: paymentAmount,
      paymentMethod,
      referenceNumber: paymentRef,
      paymentDate: new Date().toISOString().slice(0, 10),
      notes: `Payment recorded via invoice table`,
    });
  };

  const handleArchive = (inv: Invoice) => {
    if (confirm(`Are you sure you want to archive invoice ${inv.invoiceNumber}? Historical records will be retained.`)) {
      archiveMutation.mutate(inv._id);
    }
  };

  const invoices = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Invoice History
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            View, search, print, download, and manage GST tax invoices
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/invoices/new')}
        >
          Create New Invoice
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search invoice number, client name, phone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#E8ECF3] rounded-lg text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>

          {/* Payment Status */}
          <div>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAID">Paid Only</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="UNPAID">Unpaid / Overdue</option>
            </select>
          </div>

          {/* Manager */}
          <div>
            <select
              value={managerFilter}
              onChange={(e) => {
                setManagerFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">All Managers</option>
              <option value="hiren">Issued by Hiren</option>
              <option value="suresh">Issued by Suresh</option>
            </select>
          </div>

          {/* Refresh Action */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      <Card className="overflow-hidden p-0 border border-[#E8ECF3]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-[#64748B] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Manager</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF3]">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Invoice # */}
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#2563EB] bg-blue-50/60 px-2 py-0.5 rounded">
                      {inv.invoiceNumber}
                    </span>
                  </td>

                  {/* Customer */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#111827]">{inv.customer.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.customer.mobile}</div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {formatDate(inv.date)}
                  </td>

                  {/* Total */}
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    {formatINR(inv.grandTotal)}
                  </td>

                  {/* Paid */}
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                    {formatINR(inv.amountPaid)}
                  </td>

                  {/* Balance */}
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {formatINR(inv.balanceDue)}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    <Badge status={inv.paymentStatus} />
                  </td>

                  {/* Manager */}
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {inv.managerName}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Preview PDF */}
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                        title="View & Preview Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Download PDF */}
                      <button
                        onClick={() => window.open(invoicesApi.getPdfUrl(inv._id), '_blank')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Download A4 PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Print PDF */}
                      <button
                        onClick={() => {
                          const w = window.open(invoicesApi.getPdfUrl(inv._id), '_blank');
                          if (w) w.focus();
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Record Payment (if unpaid) */}
                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-colors font-bold"
                          title="Record Payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}

                      {/* Archive */}
                      <button
                        onClick={() => handleArchive(inv)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Archive Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-600">No invoices matching filters</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Create a new invoice or adjust your search parameters.
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
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} invoices)
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

      {/* PDF Document Preview Modal */}
      {previewInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewInvoice(null)}
          title={`Invoice ${previewInvoice.invoiceNumber}`}
          description={`Issued to ${previewInvoice.customer.name} on ${formatDate(previewInvoice.date)}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-[#E8ECF3]">
              <div className="flex items-center gap-3">
                <Badge status={previewInvoice.paymentStatus} />
                <span className="text-xs font-bold text-slate-700">
                  Total: {formatINR(previewInvoice.grandTotal)}
                </span>
                <span className="text-xs text-slate-500">
                  Balance: {formatINR(previewInvoice.balanceDue)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Printer className="w-3.5 h-3.5" />}
                  onClick={() => {
                    const w = window.open(invoicesApi.getPdfUrl(previewInvoice._id), '_blank');
                    if (w) w.focus();
                  }}
                >
                  Print
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => window.open(invoicesApi.getPdfUrl(previewInvoice._id), '_blank')}
                >
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="h-[550px] w-full border border-slate-300 rounded-xl overflow-hidden shadow-inner bg-slate-100">
              <iframe
                src={invoicesApi.getPdfUrl(previewInvoice._id)}
                title="Invoice PDF"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Record Payment Modal */}
      {paymentTargetInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPaymentTargetInvoice(null)}
          title={`Record Payment for ${paymentTargetInvoice.invoiceNumber}`}
          description={`Customer: ${paymentTargetInvoice.customer.name} | Total: ${formatINR(
            paymentTargetInvoice.grandTotal
          )} | Current Due: ${formatINR(paymentTargetInvoice.balanceDue)}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
            <Input
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              max={paymentTargetInvoice.balanceDue}
              required
              value={paymentAmount || ''}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
            />

            <div>
              <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
                Payment Channel / Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
              >
                <option value="CASH">Cash Payment</option>
                <option value="UPI">Google Pay / PhonePe / UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer (NEFT / RTGS)</option>
                <option value="CHEQUE">Bank Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <Input
              label="Transaction Reference / Cheque No. (Optional)"
              value={paymentRef}
              onChange={(e) => setPaymentRef(e.target.value)}
              placeholder="e.g. UPI/2611/847291 or Chq #482910"
            />

            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {paymentError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E8ECF3]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentTargetInvoice(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={recordPaymentMutation.isPending}
              >
                Confirm Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
