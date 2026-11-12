import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Building, Lock, CheckCircle2, AlertCircle, Save, ShieldCheck } from 'lucide-react';
import { settingsApi, authApi } from '../../services/api';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const { manager } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'business' | 'security'>('business');

  // Business Settings Query
  const { data: businessData, isLoading } = useQuery({
    queryKey: ['businessSettings'],
    queryFn: settingsApi.getBusiness,
  });

  // Business Form State
  const [businessForm, setBusinessForm] = useState({
    businessName: '',
    tagline: '',
    phone1: '',
    phone2: '',
    email: '',
    address: '',
    city: 'Rajkot',
    state: 'Gujarat',
    pinCode: '360001',
    gstin: '',
    pan: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    upiId: '',
    invoicePrefix: 'SE',
    defaultNotes: '',
    isGstEnabled: true,
  });

  const [bizSuccess, setBizSuccess] = useState(false);
  const [bizError, setBizError] = useState<string | null>(null);

  useEffect(() => {
    if (businessData?.data) {
      const b = businessData.data;
      setBusinessForm({
        businessName: b.businessName || '',
        tagline: b.tagline || '',
        phone1: b.phone1 || '',
        phone2: b.phone2 || '',
        email: b.email || '',
        address: b.address || '',
        city: b.city || 'Rajkot',
        state: b.state || 'Gujarat',
        pinCode: b.pinCode || '360001',
        gstin: b.gstin || '',
        pan: b.pan || '',
        bankName: b.bankName || '',
        accountNumber: b.accountNumber || '',
        ifscCode: b.ifscCode || '',
        branch: b.branch || '',
        upiId: b.upiId || '',
        invoicePrefix: b.invoicePrefix || 'SE',
        defaultNotes: b.defaultNotes || '',
        isGstEnabled: b.isGstEnabled ?? true,
      });
    }
  }, [businessData]);

  // Business Mutation
  const updateBusinessMutation = useMutation({
    mutationFn: settingsApi.updateBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businessSettings'] });
      setBizSuccess(true);
      setBizError(null);
      setTimeout(() => setBizSuccess(false), 3000);
    },
    onError: (err: any) => setBizError(err.message),
  });

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessMutation.mutate(businessForm);
  };

  // Change Password State
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match');
      return;
    }
    if (newPass.length < 4) {
      setPassError('New password/PIN must be at least 4 characters');
      return;
    }

    setPassLoading(true);
    setPassError(null);

    try {
      await authApi.changePassword(currPass, newPass);
      setPassSuccess(true);
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change manager password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-[#111827] tracking-tight">
          System & Business Settings
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Configure business profile, banking coordinates, GST settings, and manager credentials
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E8ECF3] pb-2">
        <button
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'business'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          Business Profile & Invoice Settings
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'security'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4" />
          Manager Security & PIN
        </button>
      </div>

      {/* TAB 1: BUSINESS PROFILE */}
      {activeTab === 'business' && (
        <form onSubmit={handleSaveBusiness} className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-[#E8ECF3] pb-2">
              Company Branding & Contact Coordinates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Enterprise Business Name"
                required
                value={businessForm.businessName}
                onChange={(e) => setBusinessForm({ ...businessForm, businessName: e.target.value })}
              />
              <Input
                label="Business Subtitle / Tagline"
                value={businessForm.tagline}
                onChange={(e) => setBusinessForm({ ...businessForm, tagline: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Primary Phone Number"
                required
                value={businessForm.phone1}
                onChange={(e) => setBusinessForm({ ...businessForm, phone1: e.target.value })}
              />
              <Input
                label="Secondary Phone Number"
                value={businessForm.phone2}
                onChange={(e) => setBusinessForm({ ...businessForm, phone2: e.target.value })}
              />
              <Input
                label="Business Email"
                type="email"
                value={businessForm.email}
                onChange={(e) => setBusinessForm({ ...businessForm, email: e.target.value })}
              />
            </div>

            <Input
              label="Shop / Office Address"
              value={businessForm.address}
              onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City"
                value={businessForm.city}
                onChange={(e) => setBusinessForm({ ...businessForm, city: e.target.value })}
              />
              <Input
                label="State"
                value={businessForm.state}
                onChange={(e) => setBusinessForm({ ...businessForm, state: e.target.value })}
              />
              <Input
                label="PIN Code"
                value={businessForm.pinCode}
                onChange={(e) => setBusinessForm({ ...businessForm, pinCode: e.target.value })}
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-[#E8ECF3] pb-2">
              GSTIN & Bank Payment Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GSTIN Number"
                value={businessForm.gstin}
                onChange={(e) => setBusinessForm({ ...businessForm, gstin: e.target.value.toUpperCase() })}
              />
              <Input
                label="PAN Number"
                value={businessForm.pan}
                onChange={(e) => setBusinessForm({ ...businessForm, pan: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Bank Name"
                value={businessForm.bankName}
                onChange={(e) => setBusinessForm({ ...businessForm, bankName: e.target.value })}
              />
              <Input
                label="Bank Account Number"
                value={businessForm.accountNumber}
                onChange={(e) => setBusinessForm({ ...businessForm, accountNumber: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="IFSC Code"
                value={businessForm.ifscCode}
                onChange={(e) => setBusinessForm({ ...businessForm, ifscCode: e.target.value.toUpperCase() })}
              />
              <Input
                label="UPI ID for Invoices"
                value={businessForm.upiId}
                onChange={(e) => setBusinessForm({ ...businessForm, upiId: e.target.value })}
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-[#E8ECF3] pb-2">
              Invoice Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Invoice Number Prefix"
                value={businessForm.invoicePrefix}
                onChange={(e) => setBusinessForm({ ...businessForm, invoicePrefix: e.target.value.toUpperCase() })}
                helperText="Standard format: SE-yyMM-XXX"
              />

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="gst-toggle"
                  checked={businessForm.isGstEnabled}
                  onChange={(e) => setBusinessForm({ ...businessForm, isGstEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                />
                <label htmlFor="gst-toggle" className="text-xs font-semibold text-slate-800">
                  Enable Indian GST Calculation System (CGST/SGST/IGST)
                </label>
              </div>
            </div>

            <Input
              label="Default Footer Customer Note"
              value={businessForm.defaultNotes}
              onChange={(e) => setBusinessForm({ ...businessForm, defaultNotes: e.target.value })}
            />
          </Card>

          {bizSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Business profile updated successfully!</span>
            </div>
          )}

          {bizError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {bizError}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={updateBusinessMutation.isPending}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Business Profile
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: MANAGER SECURITY */}
      {activeTab === 'security' && (
        <form onSubmit={handleSavePassword} className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E8ECF3] pb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-sm uppercase">
                {manager?.displayName?.charAt(0) || 'M'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{manager?.displayName}</h3>
                <p className="text-xs text-slate-500 font-mono">@{manager?.username} &bull; Authorized Manager</p>
              </div>
            </div>

            <Input
              label="Current Password / PIN"
              type="password"
              required
              value={currPass}
              onChange={(e) => setCurrPass(e.target.value)}
              placeholder="Enter current PIN..."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password / PIN"
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="At least 4 characters..."
              />
              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repeat new PIN..."
              />
            </div>

            {passSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Manager password updated successfully!</span>
              </div>
            )}

            {passError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {passError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={passLoading}
                leftIcon={<Lock className="w-4 h-4" />}
              >
                Update Password
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};
