import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  Search,
  Calendar,
  IndianRupee,
  RefreshCw,
  Wallet,
  Smartphone,
  Building2,
  FileCheck,
} from 'lucide-react';
import { paymentsApi } from '../../services/api';
import { Payment } from '../../types';
import { formatINR, formatDate } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const PaymentListPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['payments', { page, method: methodFilter === 'ALL' ? '' : methodFilter, startDate, endDate }],
    queryFn: () =>
      paymentsApi.getAll({
        page,
        limit: 30,
        paymentMethod: methodFilter === 'ALL' ? undefined : methodFilter,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  });

  const payments = data?.data || [];
  const pagination = data?.pagination;

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'UPI':
        return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
      case 'BANK_TRANSFER':
        return <Building2 className="w-3.5 h-3.5 text-indigo-500" />;
      case 'CHEQUE':
        return <FileCheck className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Wallet className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Payment Transactions
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Audit trail of customer payments, receipts, and collection settlement channels
          </p>
        </div>

        {/* Collection Summary Pill */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs">
          <IndianRupee className="w-4 h-4 text-emerald-600" />
          <div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase block">
              Filtered Collections Total
            </span>
            <span className="text-base font-black text-emerald-800">
              {formatINR(totalCollected)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="CASH">Cash</option>
              <option value="UPI">Google Pay / UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
              <option value="CHEQUE">Bank Cheque</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From Date"
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To Date"
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none"
            />
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => refetch()}
            >
              Refresh Transactions
            </Button>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="overflow-hidden p-0 border border-[#E8ECF3]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-[#64748B] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Ref / Notes</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4 text-center">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF3]">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#2563EB]">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#111827]">
                    {p.customerName}
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {formatDate(p.paymentDate)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800">
                      {getMethodIcon(p.paymentMethod)}
                      <span>{p.paymentMethod}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {p.referenceNumber || p.notes || '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-sm text-emerald-600">
                    +{formatINR(p.amount)}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-700">
                    {p.recordedBy?.displayName || 'Manager'}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-600">No payment receipts found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Payments recorded during invoice generation or via the invoice list will show here.
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
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} payments)
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
    </div>
  );
};
