import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  Package,
  TrendingUp,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { reportsApi } from '../../services/api';
import { formatINR } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'customers' | 'products' | 'payments'>('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<'daily' | 'monthly' | 'yearly'>('monthly');

  // Queries
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['salesReport', { startDate, endDate, groupBy }],
    queryFn: () => reportsApi.getSales({ startDate, endDate, groupBy }),
    enabled: activeTab === 'sales',
  });

  const { data: customerData, isLoading: customerLoading } = useQuery({
    queryKey: ['customerReport', { startDate, endDate }],
    queryFn: () => reportsApi.getCustomers({ startDate, endDate }),
    enabled: activeTab === 'customers',
  });

  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['productReport', { startDate, endDate }],
    queryFn: () => reportsApi.getProducts({ startDate, endDate }),
    enabled: activeTab === 'products',
  });

  const { data: paymentData, isLoading: paymentLoading } = useQuery({
    queryKey: ['paymentReport', { startDate, endDate }],
    queryFn: () => reportsApi.getPayments({ startDate, endDate }),
    enabled: activeTab === 'payments',
  });

  const salesReport = salesData?.data || [];
  const customerReport = customerData?.data || [];
  const productReport = productData?.data || [];
  const paymentReport = paymentData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Financial & Sales Reports
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Aggregated business intelligence derived from authentic database records
          </p>
        </div>

        <Button
          variant="outline"
          leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          onClick={() => window.open(reportsApi.getExportCsvUrl(), '_blank')}
        >
          Export All Invoices (CSV)
        </Button>
      </div>

      {/* Filter and Tab Bar */}
      <Card className="p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'sales'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales Summary
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'customers'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer-Wise
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Product-Wise
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'payments'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Collections
            </button>
          </div>

          {/* Date range inputs */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#E8ECF3] rounded-lg text-[#111827]"
              placeholder="From"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-[#F8FAFC] border border-[#E8ECF3] rounded-lg text-[#111827]"
              placeholder="To"
            />
          </div>
        </div>
      </Card>

      {/* TAB 1: SALES SUMMARY */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Period Sales Chart</h3>
                <p className="text-xs text-slate-500">Gross revenue invoiced over time</p>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-400">Group by:</span>
                {(['daily', 'monthly', 'yearly'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGroupBy(g)}
                    className={`px-2 py-1 rounded capitalize font-medium ${
                      groupBy === g
                        ? 'bg-blue-100 text-[#2563EB] font-bold'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full">
              {salesReport.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesReport} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip
                      formatter={(val: any) => [formatINR(val), 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E8ECF3',
                      }}
                    />
                    <Bar dataKey="totalSales" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No sales data for the selected range.
                </div>
              )}
            </div>
          </Card>

          {/* Breakdown Table */}
          <Card className="overflow-hidden p-0 border border-[#E8ECF3]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-center">Invoices Issued</th>
                  <th className="py-3 px-4 text-right">Taxable Amount</th>
                  <th className="py-3 px-4 text-right">Tax Collected</th>
                  <th className="py-3 px-4 text-right">Total Revenue</th>
                  <th className="py-3 px-4 text-right">Payments Collected</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF3]">
                {salesReport.map((row: any) => (
                  <tr key={row.period} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.period}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-600">{row.invoiceCount}</td>
                    <td className="py-3 px-4 text-right">{formatINR(row.taxableAmount)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatINR(row.taxCollected)}</td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">{formatINR(row.totalSales)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatINR(row.amountPaid)}</td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600">{formatINR(row.balanceDue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 2: CUSTOMER-WISE */}
      {activeTab === 'customers' && (
        <Card className="overflow-hidden p-0 border border-[#E8ECF3]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4 text-center">Invoices</th>
                <th className="py-3 px-4 text-right">Total Invoiced</th>
                <th className="py-3 px-4 text-right">Total Paid</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF3]">
              {customerReport.map((c: any) => (
                <tr key={c.customerName} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.customerName}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{c.mobile || '-'}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600">{c.invoiceCount}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">{formatINR(c.totalSpent)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatINR(c.totalPaid)}</td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600">{formatINR(c.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 3: PRODUCT-WISE */}
      {activeTab === 'products' && (
        <Card className="overflow-hidden p-0 border border-[#E8ECF3]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Catalog Product / Item</th>
                <th className="py-3 px-4 text-center">Unit</th>
                <th className="py-3 px-4 text-center">Total Quantity Sold</th>
                <th className="py-3 px-4 text-center">Invoices Count</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF3]">
              {productReport.map((p: any) => (
                <tr key={p.productName} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.productName}</td>
                  <td className="py-3 px-4 text-center text-slate-500">{p.unit}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">{p.quantitySold}</td>
                  <td className="py-3 px-4 text-center text-slate-600">{p.invoiceOccurrences}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">{formatINR(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 4: PAYMENTS */}
      {activeTab === 'payments' && (
        <Card className="overflow-hidden p-0 border border-[#E8ECF3]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-center">Transactions Count</th>
                <th className="py-3 px-4 text-right">Total Collected (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF3]">
              {paymentReport.map((p: any) => (
                <tr key={p.paymentMethod} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{p.paymentMethod}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600">{p.transactionsCount}</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-600">{formatINR(p.totalCollected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
