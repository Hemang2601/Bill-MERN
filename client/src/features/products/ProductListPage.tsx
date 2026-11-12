import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import { productsApi } from '../../services/api';
import { Product, ProductUnit } from '../../types';
import { formatINR } from '../../lib/utils';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const ProductListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'Electrical',
    unit: 'Nos' as ProductUnit,
    sellingPrice: 0,
    purchasePrice: 0,
    taxRate: 18,
    hsn: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Products
  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search, category: selectedCategory === 'ALL' ? '' : selectedCategory }],
    queryFn: () =>
      productsApi.getAll({
        page,
        limit: 30,
        search,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
      }),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (err: any) => setFormError(err.message),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      resetForm();
    },
    onError: (err: any) => setFormError(err.message),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: 'Electrical',
      unit: 'Nos',
      sellingPrice: 0,
      purchasePrice: 0,
      taxRate: 18,
      hsn: '',
    });
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku || '',
      description: p.description || '',
      category: p.category,
      unit: p.unit,
      sellingPrice: p.sellingPrice,
      purchasePrice: p.purchasePrice || 0,
      taxRate: p.taxRate,
      hsn: p.hsn || '',
    });
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Product name is required');
      return;
    }
    if (formData.sellingPrice < 0) {
      setFormError('Selling price cannot be negative');
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (p: Product) => {
    if (confirm(`Are you sure you want to remove "${p.name}" from the active catalog?`)) {
      deleteMutation.mutate(p._id);
    }
  };

  const products = data?.data || [];
  const pagination = data?.pagination;

  const categories = [
    'ALL',
    'Switches & Sockets',
    'Lighting',
    'Wires & Cables',
    'Protection Devices',
    'Boxes & Enclosures',
    'Electrical',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Products & Service Catalog
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Electrical fittings, wire coils, lighting fixtures, and standard rates
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenAdd}
        >
          Add Product / Item
        </Button>
      </div>

      {/* Categories Tabs & Search */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white border border-[#E8ECF3] text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
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
              placeholder="Search catalog by product name, SKU, HSN, or description..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#E8ECF3] rounded-lg text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
          </div>
        </Card>
      </div>

      {/* Catalog Table */}
      <Card className="overflow-hidden p-0 border border-[#E8ECF3]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E8ECF3] text-[#64748B] uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Item Name & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">HSN Code</th>
                <th className="py-3 px-4">Unit</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">GST Rate</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8ECF3]">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#111827]">{p.name}</div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      {p.sku && <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-semibold">{p.sku}</span>}
                      {p.description && <span className="truncate max-w-[200px]">{p.description}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {p.hsn || '-'}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {p.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#111827]">
                    {formatINR(p.sellingPrice)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      {p.taxRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Archive Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-slate-600">No products found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Add electrical goods to populate the catalog.
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
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} items)
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isAddOpen || !!editingProduct}
        onClose={() => {
          setIsAddOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Catalog Product' : 'Add Catalog Product'}
        description="Enter product name, pricing rate, tax percentage, and unit measurements."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. 1.5mm FR PVC Copper Wire Coil (90m)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU / Item Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="e.g. WIRE-1.5-FR"
            />
            <Input
              label="HSN / SAC Code"
              value={formData.hsn}
              onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
              placeholder="e.g. 8544"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="Switches & Sockets">Switches & Sockets</option>
                <option value="Lighting">Lighting</option>
                <option value="Wires & Cables">Wires & Cables</option>
                <option value="Protection Devices">Protection Devices</option>
                <option value="Boxes & Enclosures">Boxes & Enclosures</option>
                <option value="Electrical">Electrical</option>
                <option value="Services & Labor">Services & Labor</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
                Unit of Measurement
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value as ProductUnit })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value="Nos">Nos (Numbers)</option>
                <option value="Pcs">Pcs (Pieces)</option>
                <option value="Mtr">Mtr (Meters)</option>
                <option value="Coil">Coil (90m)</option>
                <option value="Set">Set</option>
                <option value="Box">Box</option>
                <option value="Pkt">Pkt (Packet)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Selling Price (₹)"
              type="number"
              step="0.01"
              required
              value={formData.sellingPrice || ''}
              onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label="Purchase Rate (₹)"
              type="number"
              step="0.01"
              value={formData.purchasePrice || ''}
              onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
            />
            <div>
              <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
                GST Rate (%)
              </label>
              <select
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8ECF3] rounded-lg text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18% (Standard)</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          <Input
            label="Description / Specifications"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="e.g. Polycab Flame Retardant Pure Electrolytic Copper"
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
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingProduct ? 'Save Changes' : 'Add to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
