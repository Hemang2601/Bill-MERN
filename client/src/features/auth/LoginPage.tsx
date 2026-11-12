import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, ShieldCheck, Zap, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login, manager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedUser, setSelectedUser] = useState<'hiren' | 'suresh'>('hiren');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (manager) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [manager, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your manager security PIN or password');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await login(selectedUser, password);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid manager password/PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#F7F8FC] selection:bg-blue-100 selection:text-blue-900">
      {/* Background Decorative subtle gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#0EA5E9] p-3 shadow-lg shadow-blue-500/20 mb-4 ring-4 ring-white">
            <img
              src="/assets/icons/app_icon.png"
              alt="Shree Shakti Logo"
              className="w-full h-full object-contain filter drop-shadow"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight uppercase">
            Shree Shakti Electric
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-medium">
            Authorized Business Billing & Enterprise Management Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-[#E8ECF3] rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Two-Manager Authentication</span>
            </div>
            <h2 className="text-xl font-bold text-[#111827]">Select Authorized Account</h2>
            <p className="text-xs text-[#64748B] mt-1">
              Only provisioned managers (Hiren or Suresh) are authorized to access the billing records.
            </p>
          </div>

          {/* Manager Identity Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Hiren */}
            <button
              type="button"
              onClick={() => {
                setSelectedUser('hiren');
                setError(null);
              }}
              className={`flex flex-col items-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedUser === 'hiren'
                  ? 'border-[#2563EB] bg-blue-50/50 shadow-xs ring-2 ring-[#2563EB]/10'
                  : 'border-[#E8ECF3] bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-base text-[#2563EB] mb-2 shadow-xs">
                H
              </div>
              <span className="text-sm font-bold text-[#111827]">Hiren</span>
              <span className="text-[10px] text-[#64748B] font-medium">Manager</span>
              {selectedUser === 'hiren' && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#2563EB]">
                  <UserCheck className="w-3.5 h-3.5" />
                  Selected
                </div>
              )}
            </button>

            {/* Suresh */}
            <button
              type="button"
              onClick={() => {
                setSelectedUser('suresh');
                setError(null);
              }}
              className={`flex flex-col items-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedUser === 'suresh'
                  ? 'border-[#2563EB] bg-blue-50/50 shadow-xs ring-2 ring-[#2563EB]/10'
                  : 'border-[#E8ECF3] bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-base text-[#172554] mb-2 shadow-xs">
                S
              </div>
              <span className="text-sm font-bold text-[#111827]">Suresh</span>
              <span className="text-[10px] text-[#64748B] font-medium">Manager</span>
              {selectedUser === 'suresh' && (
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#2563EB]">
                  <UserCheck className="w-3.5 h-3.5" />
                  Selected
                </div>
              )}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
                Manager PIN / Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`Enter PIN for ${selectedUser === 'hiren' ? 'Hiren' : 'Suresh'}...`}
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E8ECF3] rounded-xl text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold shadow-md shadow-blue-500/15"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In as {selectedUser === 'hiren' ? 'Hiren' : 'Suresh'}
            </Button>
          </form>

          {/* Footer security note */}
          <div className="mt-6 pt-5 border-t border-[#E8ECF3] text-center">
            <p className="text-[11px] text-slate-500">
              Shared MongoDB Central Database &bull; Secured with Argon2id / Bcrypt &bull; HttpOnly Session
            </p>
          </div>
        </div>

        {/* Public Landing Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/landing')}
            className="text-xs font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
          >
            &larr; View Public Software Landing Page
          </button>
        </div>
      </motion.div>
    </div>
  );
};
