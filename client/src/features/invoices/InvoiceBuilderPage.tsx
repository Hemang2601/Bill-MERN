import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  FilePlus,
  Users,
  ShoppingCart,
  CheckCircle2,
  Plus,
  Trash2,
  Search,
  ArrowRight,
  ArrowLeft,
  Download,
  Printer,
  Calendar,
  Building,
  CreditCard,
  AlertCircle,
  HelpCircle,
  Check,
  Zap,
} from 'lucide-react';
import { customersApi, productsApi, invoicesApi, settingsApi } from '../../services/api';
import { Customer, Product, ProductUnit } from '../../types';
import { calculateClientInvoice } from '../../lib/calculations';
import { formatINR, amountInWords, formatDate } from '../../lib/utils';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

interface WizardItem {
  _id: string;
  productId?: string;
  name: string;
  description: string;
  hsn: string;
  quantity: number;
  unit: ProductUnit;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  gstRate: number;
}

export const InvoiceBuilderPage: React.FC = () => {
  const { manager } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Business Settings Query
  const { data: settingsData } = useQuery({
    queryKey: ['businessSettings'],
    queryFn: settingsApi.getBusiness,
  });
  const settings = settingsData?.data;

  // Customers Query
  const { data: customersData } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: () => customersApi.getAll({ limit: 100 }),
  });
  const customersList = customersData?.data || [];

  // Products Query
  const { data: productsData } = useQuery({
    queryKey: ['allProducts'],
    queryFn: () => productsApi.getAll({ limit: 100 }),
  });
  const productsCatalog = productsData?.data || [];

  // Step 1: Customer & Invoice Meta State
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSnapshot, setCustomerSnapshot] = useState({
    customerId: '',
    name: '',
    mobile: '',
    email: '',
    billingAddress: '',
    city: 'Rajkot',
    state: 'Gujarat',
    pinCode: '',
    gstin: '',
  });

  const todayStr = new Date().toISOString().slice(0, 10);
  const [invoiceDate, setInvoiceDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('Gujarat (24)');
  const [isInterState, setIsInterState] = useState(false);
  const [notes, setNotes] = useState('');

  // Quick Add Customer Modal inside wizard
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddForm, setQuickAddForm] = useState({
    name: '',
    mobile: '',
    email: '',
    billingAddress: '',
    city: 'Rajkot',
    state: 'Gujarat',
    pinCode: '',
    gstin: '',
  });

  // Step 2: Items State
  const [items, setItems] = useState<WizardItem[]>([
    {
      _id: 'item-1',
      productId: '',
      name: '',
      description: '',
      hsn: '',
      quantity: 1,
      unit: 'Nos',
      rate: 0,
      discountPercent: 0,
      discountAmount: 0,
      gstRate: 18,
    },
  ]);

  // Step 3: Upfront Payment State
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Success Modal
  const [createdInvoice, setCreatedInvoice] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Handle existing customer selection
  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomerId(c._id);
    setCustomerSnapshot({
      customerId: c._id,
      name: c.name,
      mobile: c.mobile,
      email: c.email || '',
      billingAddress: c.billingAddress || '',
      city: c.city || 'Rajkot',
      state: c.state || 'Gujarat',
      pinCode: c.pinCode || '',
      gstin: c.gstin || '',
    });
    setCustomerSearch('');
  };

  // Quick customer create mutation
  const quickCustomerMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['allCustomers'] });
      if (res.data) {
        handleSelectCustomer(res.data);
      }
      setQuickAddOpen(false);
    },
  });

  // Item helpers
  const addItemRow = () => {
    const newItem: WizardItem = {
      _id: `item-${Date.now()}`,
      productId: '',
      name: '',
      description: '',
      hsn: '',
      quantity: 1,
      unit: 'Nos',
      rate: 0,
      discountPercent: 0,
      discountAmount: 0,
      gstRate: settings?.defaultGstRate ?? 18,
    };
    setItems([...items, newItem]);
  };

  const removeItemRow = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const updateItemField = (idx: number, field: keyof WizardItem, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    setItems(updated);
  };

  const selectProductForItem = (idx: number, p: Product) => {
    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      productId: p._id,
      name: p.name,
      description: p.description || '',
      hsn: p.hsn || '',
      unit: p.unit,
      rate: p.sellingPrice,
      gstRate: p.taxRate,
    };
    setItems(updated);
  };

  // Calculated Invoice live totals
  const calculated = calculateClientInvoice(
    items,
    isInterState,
    settings?.isGstEnabled ?? true,
    amountPaid
  );

  // Validation before proceeding
  const handleNextStep = () => {
    setStepError(null);
    if (currentStep === 1) {
      if (!customerSnapshot.name.trim()) {
        setStepError('Please enter or select a customer name');
        return;
      }
      if (!customerSnapshot.mobile.trim()) {
        setStepError('Please enter a customer mobile number');
        return;
      }
      if (!invoiceDate) {
        setStepError('Please select a valid invoice date');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (items.length === 0) {
        setStepError('At least one item must be added');
        return;
      }
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (!it.name.trim()) {
          setStepError(`Item #${i + 1} has an empty name`);
          return;
        }
        if (it.quantity <= 0) {
          setStepError(`Item #${i + 1} quantity must be greater than 0`);
          return;
        }
        if (it.rate < 0) {
          setStepError(`Item #${i + 1} rate cannot be negative`);
          return;
        }
      }
      setCurrentStep(3);
    }
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setStepError(null);

    try {
      const payload = {
        customer: customerSnapshot,
        items: items.map((i) => ({
          productId: i.productId || undefined,
          name: i.name,
          description: i.description || undefined,
          hsn: i.hsn || undefined,
          quantity: i.quantity,
          unit: i.unit,
          rate: i.rate,
          discountPercent: i.discountPercent,
          discountAmount: i.discountAmount,
          gstRate: i.gstRate,
        })),
        date: invoiceDate,
        dueDate: dueDate || undefined,
        placeOfSupply,
        isInterState,
        amountPaid: amountPaid,
        notes: notes || undefined,
      };

      const res = await invoicesApi.create(payload);

      if (res.success && res.data) {
        setCreatedInvoice(res.data);
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
        queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      }
    } catch (err: any) {
      setStepError(err.message || 'Failed to generate tax invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Step Progress Tracker */}
      <div className="bg-white border border-[#E8ECF3] rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Step 1 */}
          <div
            onClick={() => currentStep > 1 && setCurrentStep(1)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentStep === 1 ? 'text-[#2563EB]' : currentStep > 1 ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                currentStep === 1
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : currentStep > 1
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold uppercase tracking-wider">Step 1</span>
              <span className="block text-xs font-medium text-slate-600">Customer Details</span>
            </div>
          </div>

          <div className="flex-1 h-0.5 bg-[#E8ECF3] mx-4" />

          {/* Step 2 */}
          <div
            onClick={() => currentStep > 2 && setCurrentStep(2)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentStep === 2 ? 'text-[#2563EB]' : currentStep > 2 ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                currentStep === 2
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : currentStep > 2
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold uppercase tracking-wider">Step 2</span>
              <span className="block text-xs font-medium text-slate-600">Items & Pricing</span>
            </div>
          </div>

          <div className="flex-1 h-0.5 bg-[#E8ECF3] mx-4" />

          {/* Step 3 */}
          <div
            className={`flex items-center gap-3 ${
              currentStep === 3 ? 'text-[#2563EB]' : 'text-slate-400'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                currentStep === 3 ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-slate-100 text-slate-500'
              }`}
            >
              3
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold uppercase tracking-wider">Step 3</span>
              <span className="block text-xs font-medium text-slate-600">Review & Save</span>
            </div>
          </div>
        </div>
      </div>

      {stepError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{stepError}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: CUSTOMER & METADATA */}
      {/* ========================================================= */}
      {currentStep === 1 && (
        <Card className="space-y-6">
          <div className="border-b border-[#E8ECF3] pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#111827]">Customer & Supply Information</h3>
              <p className="text-xs text-[#64748B]">Select an existing client or enter invoice recipient details</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setQuickAddOpen(true)}>
              + Quick Add Client
            </Button>
          </div>

          {/* Quick Customer Picker Autocomplete */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider">
              Search & Select Existing Customer
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Type customer name or phone to pick from directory..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#F8FAFC] border border-[#E8ECF3] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            {/* Matching dropdown */}
            {customerSearch.trim() && (
              <div className="border border-[#E8ECF3] rounded-xl bg-white shadow-lg max-h-48 overflow-y-auto divide-y divide-[#E8ECF3]">
                {customersList
                  .filter(
                    (c) =>
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.mobile.includes(customerSearch)
                  )
                  .map((c) => (
                    <div
                      key={c._id}
                      onClick={() => handleSelectCustomer(c)}
                      className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#111827]">{c.name}</span>
                        <span className="text-slate-400 ml-2 font-mono">{c.mobile}</span>
                      </div>
                      <span className="text-[10px] text-blue-600 font-semibold">Select &rarr;</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Editable Customer Snapshot Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Recipient / Customer Name"
              required
              value={customerSnapshot.name}
              onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, name: e.target.value })}
              placeholder="e.g. Patel Enterprise or Cash Customer"
            />
            <Input
              label="Mobile Number"
              required
              value={customerSnapshot.mobile}
              onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, mobile: e.target.value })}
              placeholder="e.g. +91 98250 12345"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Billing Address"
              value={customerSnapshot.billingAddress}
              onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, billingAddress: e.target.value })}
              placeholder="e.g. Shop 12, Main Bazar"
            />
            <Input
              label="Customer GSTIN (If Registered)"
              value={customerSnapshot.gstin}
              onChange={(e) => setCustomerSnapshot({ ...customerSnapshot, gstin: e.target.value.toUpperCase() })}
              placeholder="24AAAPS1234F1Z5"
            />
          </div>

          {/* Invoice Date & Supply Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E8ECF3]">
            <Input
              label="Invoice Date"
              type="date"
              required
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
            <Input
              label="Due Date (Optional)"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
                Place of Supply
              </label>
              <select
                value={placeOfSupply}
                onChange={(e) => {
                  const val = e.target.value;
                  setPlaceOfSupply(val);
                  setIsInterState(val !== 'Gujarat (24)');
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="Gujarat (24)">Gujarat (Intra-State: CGST + SGST)</option>
                <option value="Maharashtra (27)">Maharashtra (Inter-State: IGST)</option>
                <option value="Rajasthan (08)">Rajasthan (Inter-State: IGST)</option>
                <option value="Madhya Pradesh (23)">Madhya Pradesh (Inter-State: IGST)</option>
                <option value="Other Inter-State">Other Inter-State (IGST)</option>
              </select>
            </div>
          </div>

          {/* Step 1 Actions */}
          <div className="flex justify-end pt-4 border-t border-[#E8ECF3]">
            <Button
              variant="primary"
              size="md"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Items & Pricing
            </Button>
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* STEP 2: ITEMS AND LIVE PRICING */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8ECF3] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">Electrical Items & Services</h3>
                <p className="text-xs text-[#64748B]">Add items from catalog or create custom line items</p>
              </div>

              <Button
                size="sm"
                variant="outline"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={addItemRow}
              >
                Add Another Item
              </Button>
            </div>

            {/* Desktop Table / Responsive Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8ECF3] bg-[#F8FAFC] text-[#64748B] uppercase font-bold">
                    <th className="py-2.5 px-2 text-center w-8">#</th>
                    <th className="py-2.5 px-2 min-w-[200px]">Product / Service</th>
                    <th className="py-2.5 px-2 w-24">HSN</th>
                    <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                    <th className="py-2.5 px-2 w-24 text-center">Unit</th>
                    <th className="py-2.5 px-2 w-24 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-2 w-20 text-center">GST %</th>
                    <th className="py-2.5 px-2 w-28 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF3]">
                  {items.map((item, idx) => (
                    <tr key={item._id} className="align-top hover:bg-slate-50/50">
                      {/* Sr */}
                      <td className="py-3 px-2 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Product Name & Description & Catalog Autocomplete */}
                      <td className="py-3 px-2 space-y-1.5">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItemField(idx, 'name', e.target.value)}
                            placeholder="Item name (type or pick from catalog)..."
                            className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                          />
                        </div>

                        {/* Quick pick dropdown chips */}
                        {productsCatalog.length > 0 && !item.productId && (
                          <div className="flex flex-wrap items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-semibold">Catalog:</span>
                            {productsCatalog.slice(0, 3).map((p) => (
                              <button
                                key={p._id}
                                type="button"
                                onClick={() => selectProductForItem(idx, p)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] hover:bg-blue-100 font-medium"
                              >
                                {p.name.slice(0, 18)}...
                              </button>
                            ))}
                          </div>
                        )}

                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItemField(idx, 'description', e.target.value)}
                          placeholder="Optional specifications or brand (e.g. Anchor Roma, Polycab)..."
                          className="w-full px-2.5 py-1 text-[11px] bg-slate-50/50 border border-slate-200 rounded text-slate-600 focus:outline-none focus:bg-white"
                        />
                      </td>

                      {/* HSN */}
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          value={item.hsn}
                          onChange={(e) => updateItemField(idx, 'hsn', e.target.value)}
                          placeholder="8536"
                          className="w-full px-2 py-1.5 text-xs font-mono bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
                        />
                      </td>

                      {/* Qty */}
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          min="0.01"
                          step="any"
                          value={item.quantity || ''}
                          onChange={(e) =>
                            updateItemField(idx, 'quantity', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 text-xs text-center font-bold bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
                        />
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-2">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItemField(idx, 'unit', e.target.value as ProductUnit)}
                          className="w-full px-1.5 py-1.5 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
                        >
                          <option value="Nos">Nos</option>
                          <option value="Pcs">Pcs</option>
                          <option value="Mtr">Mtr</option>
                          <option value="Coil">Coil</option>
                          <option value="Set">Set</option>
                          <option value="Box">Box</option>
                          <option value="Pkt">Pkt</option>
                        </select>
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate || ''}
                          onChange={(e) =>
                            updateItemField(idx, 'rate', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2 py-1.5 text-xs text-right font-bold bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
                        />
                      </td>

                      {/* GST % */}
                      <td className="py-3 px-2">
                        <select
                          value={item.gstRate}
                          onChange={(e) =>
                            updateItemField(idx, 'gstRate', parseInt(e.target.value))
                          }
                          className="w-full px-1 py-1.5 text-xs text-center font-semibold bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563EB]"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>

                      {/* Line Total */}
                      <td className="py-3 px-2 text-right font-black text-sm text-[#111827]">
                        {formatINR(
                          calculated.items[idx]?.totalAmount ??
                            (item.quantity || 0) * (item.rate || 0)
                        )}
                      </td>

                      {/* Delete */}
                      <td className="py-3 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={items.length <= 1}
                          className="p-1 rounded text-slate-300 hover:text-rose-600 disabled:opacity-20 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Live Financial Computation Summary Box */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-[#E8ECF3] bg-[#F8FAFC] -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 p-4 sm:p-6 rounded-b-xl">
              <div className="max-w-xs space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Optional Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional delivery instructions or notes for client..."
                  rows={2}
                  className="w-full p-2 text-xs bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="w-full sm:w-72 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Subtotal:</span>
                  <span className="font-semibold text-slate-900">{formatINR(calculated.subtotal)}</span>
                </div>
                {settings?.isGstEnabled && (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>Taxable Amount:</span>
                      <span className="font-semibold text-slate-900">{formatINR(calculated.taxableAmount)}</span>
                    </div>
                    {isInterState ? (
                      <div className="flex justify-between text-blue-700">
                        <span>IGST:</span>
                        <span className="font-semibold">{formatINR(calculated.totalIgst)}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-blue-700">
                          <span>CGST:</span>
                          <span className="font-semibold">{formatINR(calculated.totalCgst)}</span>
                        </div>
                        <div className="flex justify-between text-blue-700">
                          <span>SGST:</span>
                          <span className="font-semibold">{formatINR(calculated.totalSgst)}</span>
                        </div>
                      </>
                    )}
                  </>
                )}
                {calculated.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Round Off:</span>
                    <span>{calculated.roundOff > 0 ? '+' : ''}{formatINR(calculated.roundOff)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#111827] pt-2 border-t border-slate-300">
                  <span>Grand Total:</span>
                  <span className="text-[#2563EB]">{formatINR(calculated.grandTotal)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Customer Details
            </Button>
            <Button
              variant="primary"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Review Invoice Preview
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: REVIEW & LIVE A4 PREVIEW */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Payment & Recording Box */}
          <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/40 border-blue-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-[#111827]">Upfront Payment Collection</h4>
                <p className="text-xs text-[#64748B]">
                  Record immediate cash, UPI, or advance payment against this invoice
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-44">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    label="Amount Received (₹)"
                    value={amountPaid || ''}
                    onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="pt-5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAmountPaid(calculated.grandTotal)}
                  >
                    Mark Full
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Live A4 Document Replica Preview */}
          <div className="bg-white border-2 border-slate-800 rounded-xl shadow-xl overflow-hidden text-xs">
            {/* Top Bar */}
            <div className="flex justify-between items-center bg-slate-100 px-4 py-1.5 border-b border-slate-800 text-[10px] font-bold text-slate-700">
              <span>TAX INVOICE</span>
              <span>GST / RETAIL BILL OF SUPPLY</span>
              <span>ORIGINAL FOR RECIPIENT</span>
            </div>

            {/* Company Branding */}
            <div className="p-4 text-center border-b border-slate-800 relative bg-white">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-wide uppercase">
                {settings?.businessName || 'SHREE SHAKTI ELECTRIC'}
              </h2>
              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                {settings?.tagline || 'Specialist in: All types of Electric Fitting, Wiring & Maintenance'}
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1">
                Phone: {settings?.phone1 || '+91 90336 60384'}{' '}
                {settings?.phone2 ? `, ${settings?.phone2}` : ''} | Address:{' '}
                {settings?.address || 'Rajkot, Gujarat'}
              </p>
              {settings?.gstin && (
                <p className="text-[10px] text-slate-500 font-medium">
                  GSTIN: <strong>{settings.gstin}</strong> | State: Gujarat (24)
                </p>
              )}
            </div>

            {/* 2-Column Info Box */}
            <div className="grid grid-cols-2 border-b border-slate-800 divide-x divide-slate-800">
              <div className="p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 border-b border-dashed border-slate-300 pb-0.5 block">
                  Billed To (Customer Details)
                </span>
                <p className="font-bold text-slate-900">{customerSnapshot.name}</p>
                <p className="text-slate-600">Mobile: {customerSnapshot.mobile}</p>
                {customerSnapshot.billingAddress && (
                  <p className="text-slate-600">{customerSnapshot.billingAddress}, {customerSnapshot.city}</p>
                )}
                {customerSnapshot.gstin && (
                  <p className="text-slate-600">GSTIN: {customerSnapshot.gstin}</p>
                )}
              </div>

              <div className="p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500 border-b border-dashed border-slate-300 pb-0.5 block">
                  Invoice Meta
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Number:</span>
                  <span className="font-bold text-[#2563EB] font-mono">[Assigned On Creation]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Invoice Date:</span>
                  <span className="font-bold text-slate-900">{formatDate(invoiceDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Place of Supply:</span>
                  <span className="font-bold text-slate-900">{placeOfSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorized Manager:</span>
                  <span className="font-bold text-slate-900">{manager?.displayName}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-800 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3 text-center w-8">#</th>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-center w-20">Qty</th>
                  <th className="py-2 px-3 text-right w-28">Rate (₹)</th>
                  <th className="py-2 px-3 text-right w-32">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {calculated.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {it.name}
                      {it.description && (
                        <div className="text-[10px] text-slate-500 font-normal">{it.description}</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-bold">{it.quantity}</td>
                    <td className="py-2 px-3 text-right">{it.rate.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {it.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary & Bottom Box */}
            <div className="grid grid-cols-2 border-t border-slate-800 divide-x divide-slate-800">
              <div className="p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Amount in Words:</span>
                  <p className="text-xs font-bold text-slate-900 italic mt-0.5">
                    {amountInWords(calculated.grandTotal)}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-dashed border-slate-300">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Terms & Conditions:</span>
                  <ul className="text-[10px] text-slate-600 list-disc list-inside mt-0.5 space-y-0.5">
                    <li>Goods once sold will not be taken back.</li>
                    <li>Guarantee / warranty as per manufacturer policy.</li>
                    <li>Subject to local jurisdiction only.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-bold text-slate-900">{formatINR(calculated.subtotal)}</span>
                </div>
                {calculated.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-semibold">- {formatINR(calculated.totalDiscount)}</span>
                  </div>
                )}
                {calculated.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>Round Off:</span>
                    <span>{calculated.roundOff > 0 ? '+' : ''}{formatINR(calculated.roundOff)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-800 bg-blue-50/50 -mx-3 px-3 py-1.5">
                  <span>Grand Total:</span>
                  <span className="text-[#2563EB]">{formatINR(calculated.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 pt-1 font-semibold">
                  <span>Amount Paid:</span>
                  <span>{formatINR(amountPaid)}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Balance Due:</span>
                  <span>{formatINR(calculated.balanceDue)}</span>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="flex justify-between items-end p-4 border-t border-slate-800 bg-slate-50">
              <div className="text-[10px] text-slate-500">
                Thank you for your business! &bull; Powered by Shree Shakti Billing
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-700 uppercase">
                  For, {settings?.businessName || 'SHREE SHAKTI ELECTRIC'}
                </p>
                <div className="h-10 flex items-center justify-center my-1">
                  <img
                    src={`/assets/images/${manager?.signatureImage || 'hiren.png'}`}
                    alt="Signature"
                    className="max-h-8 object-contain"
                  />
                </div>
                <div className="border-t border-slate-800 w-36 pt-0.5 text-[9px] font-bold text-slate-700">
                  Authorized Signatory ({manager?.displayName})
                </div>
              </div>
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Edit Items
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-5 h-5" />}
              className="font-bold shadow-lg shadow-blue-500/20"
            >
              Generate Invoice & Create PDF
            </Button>
          </div>
        </div>
      )}

      {/* Quick Add Client Modal */}
      <Modal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        title="Quick Add Customer"
        description="Add a new customer profile without losing your current invoice items"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!quickAddForm.name || !quickAddForm.mobile) return;
            quickCustomerMutation.mutate(quickAddForm);
          }}
          className="space-y-4"
        >
          <Input
            label="Customer Name"
            required
            value={quickAddForm.name}
            onChange={(e) => setQuickAddForm({ ...quickAddForm, name: e.target.value })}
            placeholder="e.g. Ramesh Electricals"
          />
          <Input
            label="Mobile Phone"
            required
            value={quickAddForm.mobile}
            onChange={(e) => setQuickAddForm({ ...quickAddForm, mobile: e.target.value })}
            placeholder="e.g. +91 99099 11223"
          />
          <Input
            label="City"
            value={quickAddForm.city}
            onChange={(e) => setQuickAddForm({ ...quickAddForm, city: e.target.value })}
          />
          <Input
            label="GSTIN (Optional)"
            value={quickAddForm.gstin}
            onChange={(e) => setQuickAddForm({ ...quickAddForm, gstin: e.target.value.toUpperCase() })}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={() => setQuickAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={quickCustomerMutation.isPending}>
              Save & Select
            </Button>
          </div>
        </form>
      </Modal>

      {/* Success Modal */}
      {createdInvoice && (
        <Modal
          isOpen={true}
          onClose={() => navigate('/invoices')}
          title="Invoice Generated Successfully!"
          description={`Tax Invoice #${createdInvoice.invoiceNumber} has been recorded in the central database.`}
          maxWidth="md"
        >
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                Invoice Total Amount
              </p>
              <h3 className="text-3xl font-black text-[#111827] mt-0.5">
                {formatINR(createdInvoice.grandTotal)}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Recipient: <strong>{createdInvoice.customer?.name}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => window.open(invoicesApi.getPdfUrl(createdInvoice._id), '_blank')}
              >
                Download / View A4 PDF
              </Button>

              <Button
                variant="outline"
                size="md"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => {
                  const printWin = window.open(invoicesApi.getPdfUrl(createdInvoice._id), '_blank');
                  if (printWin) {
                    printWin.focus();
                  }
                }}
              >
                Print Invoice
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/invoices')}
              >
                Go to Invoices History &rarr;
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
