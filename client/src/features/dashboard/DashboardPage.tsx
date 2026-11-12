import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  IndianRupee,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Plus,
  Download,
  Loader2,
  Eye,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { dashboardApi, reportsApi } from '../../services/api';
import { formatINR, formatDate } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: dashboardApi.getSummary,
    refetchInterval: 30000, // auto-refresh every 30s
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin mb-3" />
        <p className="text-sm text-[#64748B] font-medium">Loading live business metrics...</p>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <Card className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#111827]">Failed to load dashboard data</h3>
        <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
          {error instanceof Error ? error.message : 'Database query error.'}
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  const {
    kpis,
    recentInvoices,
    recentPayments,
    dailySales,
    monthlySales,
    paymentMethodDistribution,
    topProducts,
  } = data.data;

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Business Overview
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time financial analytics, revenue tracking, and invoice performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => window.open(reportsApi.getExportCsvUrl(), '_blank')}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/invoices/new')}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* 7 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden border-blue-100 bg-gradient-to-br from-white to-blue-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-blue-100 text-[#2563EB]">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-[#111827] tracking-tight">
              {formatINR(kpis.totalRevenue)}
            </h3>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Cumulative Lifetime Invoiced</span>
            </p>
          </div>
        </Card>

        {/* This Month Revenue */}
        <Card className="relative overflow-hidden border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              This Month Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-[#111827] tracking-tight">
              {formatINR(kpis.thisMonthRevenue)}
            </h3>
            <p className="text-[11px] text-[#64748B] mt-1 font-medium">
              vs. Last Month: {formatINR(kpis.lastMonthRevenue)}
            </p>
          </div>
        </Card>

        {/* Total Invoices */}
        <Card className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Total Invoices
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-[#111827] tracking-tight">
              {kpis.totalInvoices}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <span className="text-emerald-600">{kpis.paidInvoices} Paid</span>
              <span>&bull;</span>
              <span className="text-rose-600">{kpis.unpaidInvoices} Due</span>
            </div>
          </div>
        </Card>

        {/* Outstanding Balance */}
        <Card className="relative overflow-hidden border-rose-100 bg-gradient-to-br from-white to-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Outstanding Amount
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-rose-600 tracking-tight">
              {formatINR(kpis.outstandingAmount)}
            </h3>
            <p className="text-[11px] text-[#64748B] mt-1 font-medium">
              Across {kpis.unpaidInvoices + kpis.partialInvoices} pending invoices
            </p>
          </div>
        </Card>
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Customers */}
        <Card className="flex items-center gap-4 py-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#64748B] uppercase">Registered Customers</span>
            <div className="text-xl font-bold text-[#111827]">{kpis.totalCustomers} active clients</div>
          </div>
        </Card>

        {/* Paid Invoices Ratio */}
        <Card className="flex items-center gap-4 py-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#64748B] uppercase">Payment Clearance</span>
            <div className="text-xl font-bold text-[#111827]">
              {kpis.totalInvoices > 0
                ? `${Math.round((kpis.paidInvoices / kpis.totalInvoices) * 100)}%`
                : '100%'}{' '}
              cleared
            </div>
          </div>
        </Card>

        {/* Partially Paid */}
        <Card className="flex items-center gap-4 py-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#64748B] uppercase">Partial Payments</span>
            <div className="text-xl font-bold text-[#111827]">{kpis.partialInvoices} invoices in progress</div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend (2 cols) */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Monthly Sales Performance</h3>
              <p className="text-xs text-[#64748B]">Revenue trends over recorded billing months</p>
            </div>
            <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg">
              INR (₹)
            </span>
          </div>

          <div className="h-64 w-full">
            {monthlySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val: any) => [formatINR(val), 'Revenue']}
                    labelStyle={{ fontWeight: 'bold' }}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E8ECF3',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly sales records to display.
              </div>
            )}
          </div>
        </Card>

        {/* Payment Methods Breakdown (1 col) */}
        <Card>
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#111827]">Payment Channels</h3>
            <p className="text-xs text-[#64748B]">Collections distribution by method</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {paymentMethodDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodDistribution}
                    dataKey="total"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {paymentMethodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatINR(val), 'Collected']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E8ECF3',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">No payment data recorded yet</div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {paymentMethodDistribution.map((item, i) => (
              <div key={item.method} className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="font-medium">{item.method}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Products & Daily Sales Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Top-Selling Products</h3>
              <p className="text-xs text-[#64748B]">Highest revenue generating catalog items</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/products')}>
              Catalog &rarr;
            </Button>
          </div>

          <div className="h-60 w-full">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tickFormatter={(val) => `₹${val}`} tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#334155' }} width={120} />
                  <Tooltip
                    formatter={(val: any) => [formatINR(val), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E8ECF3',
                    }}
                  />
                  <Bar dataKey="revenue" fill="#0EA5E9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No product sales records yet.
              </div>
            )}
          </div>
        </Card>

        {/* Recent Invoices Table */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Recent Invoices</h3>
              <p className="text-xs text-[#64748B]">Latest transactions issued</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/invoices')}>
              View All &rarr;
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8ECF3] text-[#64748B] font-semibold">
                  <th className="pb-2.5">Invoice #</th>
                  <th className="pb-2.5">Customer</th>
                  <th className="pb-2.5">Amount</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 font-bold text-[#2563EB]">{inv.invoiceNumber}</td>
                    <td className="py-2.5 font-medium text-[#111827] truncate max-w-[120px]">
                      {inv.customer.name}
                    </td>
                    <td className="py-2.5 font-bold text-[#111827]">
                      {formatINR(inv.grandTotal)}
                    </td>
                    <td className="py-2.5">
                      <Badge status={inv.paymentStatus} />
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => navigate(`/invoices?view=${inv._id}`)}
                        className="p-1 rounded-md text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                        title="View invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {recentInvoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No invoices created yet. Click "Create Invoice" above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
