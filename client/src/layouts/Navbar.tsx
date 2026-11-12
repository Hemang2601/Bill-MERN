import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Plus,
  Calendar,
  ShieldCheck,
  User,
  LogOut,
  Bell,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { Button } from '../components/ui/Button';

interface NavbarProps {
  onToggleMobile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobile }) => {
  const { manager, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Page title mapping based on route
  const getPageMeta = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return { title: 'Business Dashboard', category: 'Overview' };
    if (path.startsWith('/invoices/new')) return { title: 'Create Tax Invoice', category: 'Invoicing' };
    if (path.startsWith('/invoices')) return { title: 'Invoice History & Management', category: 'Invoicing' };
    if (path.startsWith('/customers')) return { title: 'Customer Management', category: 'Clients' };
    if (path.startsWith('/products')) return { title: 'Products & Service Catalog', category: 'Inventory' };
    if (path.startsWith('/payments')) return { title: 'Payment Collection & Records', category: 'Finance' };
    if (path.startsWith('/reports')) return { title: 'Reports & Business Analytics', category: 'Analytics' };
    if (path.startsWith('/activity')) return { title: 'System Activity Logs', category: 'Audit' };
    if (path.startsWith('/settings')) return { title: 'Business & Invoice Settings', category: 'Configuration' };
    if (path.startsWith('/about')) return { title: 'About Shree Shakti Billing', category: 'System' };
    return { title: 'Shree Shakti Billing', category: 'Portal' };
  };

  const meta = getPageMeta();

  const formattedDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/invoices?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const closeDropdown = () => setProfileOpen(false);
    if (profileOpen) {
      window.addEventListener('click', closeDropdown);
    }
    return () => window.removeEventListener('click', closeDropdown);
  }, [profileOpen]);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-[#E8ECF3] px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile trigger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
            <span>{meta.category}</span>
            <span>/</span>
            <span className="text-[#2563EB]">{meta.title}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight truncate max-w-[200px] sm:max-w-none">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* Center: Global Quick Search */}
      <div className="hidden lg:flex items-center flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice number, customer name, mobile..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#E8ECF3] rounded-xl text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white transition-all"
          />
        </form>
      </div>

      {/* Right: Date, New Invoice CTA, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Date pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E8ECF3] text-xs font-medium text-[#64748B]">
          <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>{formattedDate}</span>
        </div>

        {/* Quick New Invoice CTA */}
        <Button
          size="sm"
          variant="primary"
          onClick={() => navigate('/invoices/new')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-xs"
        >
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </Button>

        {/* Manager Profile Menu */}
        {manager && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProfileOpen(!profileOpen);
              }}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-[#2563EB] flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {manager.displayName?.charAt(0) || 'M'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[#111827] leading-tight">
                  {manager.displayName}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Manager
                </span>
              </div>
            </button>

            {/* Profile Dropdown */}
            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white border border-[#E8ECF3] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 border-b border-[#E8ECF3]">
                  <p className="text-xs font-bold text-[#111827]">{manager.displayName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">@{manager.username}</p>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium w-fit">
                    <ShieldCheck className="w-3 h-3" />
                    Authorized Access
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#334155] hover:bg-slate-50 transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    Manager Profile & Password
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/activity');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#334155] hover:bg-slate-50 transition-colors text-left"
                  >
                    <Bell className="w-4 h-4 text-slate-400" />
                    Recent Activity Logs
                  </button>
                </div>

                <div className="pt-1 border-t border-[#E8ECF3]">
                  <button
                    onClick={async () => {
                      setProfileOpen(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
