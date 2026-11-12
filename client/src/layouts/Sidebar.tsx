import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  History,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Activity,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { manager, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Create Invoice', icon: FilePlus, path: '/invoices/new', highlight: true },
    { label: 'Invoice History', icon: History, path: '/invoices' },
    { label: 'Customers', icon: Users, path: '/customers' },
    { label: 'Products & Services', icon: Package, path: '/products' },
    { label: 'Payments', icon: CreditCard, path: '/payments' },
    { label: 'Reports & Analytics', icon: BarChart3, path: '/reports' },
    { label: 'Activity Logs', icon: Activity, path: '/activity' },
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Help / About', icon: HelpCircle, path: '/about' },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-[#E8ECF3] select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#E8ECF3]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#172554] flex items-center justify-center p-1 shadow-sm shrink-0">
            <img
              src="/assets/icons/app_icon.png"
              alt="Logo"
              className="w-full h-full object-contain filter drop-shadow"
              onError={(e) => {
                // fallback to lucide icon if missing
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-extrabold text-[#0f172a] tracking-tight truncate uppercase">
                Shree Shakti
              </span>
              <span className="text-[10px] text-[#2563EB] font-bold tracking-wider uppercase -mt-0.5 truncate">
                Billing Suite
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                    : 'text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9]',
                  item.highlight && !isActive && 'text-[#2563EB] bg-blue-50/60 font-semibold',
                  collapsed && 'justify-center px-2'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.highlight && !collapsed && (
                <span className="ml-auto text-[10px] font-bold uppercase bg-blue-100 text-[#2563EB] px-1.5 py-0.5 rounded">
                  New
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Manager Session & Logout */}
      <div className="p-3 border-t border-[#E8ECF3] bg-[#F8FAFC]">
        {manager && (
          <div
            className={cn(
              'flex items-center gap-3 p-2 rounded-xl bg-white border border-[#E8ECF3] shadow-xs mb-2',
              collapsed && 'justify-center p-1.5'
            )}
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-[#2563EB] uppercase">
                {manager.displayName?.charAt(0) || 'M'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-[#111827] truncate">
                  {manager.displayName}
                </span>
                <span className="text-[10px] text-[#64748B] capitalize truncate">
                  Authorized Manager
                </span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-rose-600 rounded-lg hover:bg-rose-50 transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:block shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0 z-30',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
