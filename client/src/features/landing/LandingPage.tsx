import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  IndianRupee,
  Layers,
  Sparkles,
  Printer,
  TrendingUp,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#111827] selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E8ECF3] px-6 lg:px-12 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#0EA5E9] p-1.5 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-base font-extrabold text-[#111827] tracking-tight uppercase block leading-none">
              Shree Shakti
            </span>
            <span className="text-[10px] text-[#2563EB] font-bold tracking-wider uppercase">
              Billing & Business Suite
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/login')}
          >
            Manager Sign In
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/login')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Portal
          </Button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-200/40 via-sky-200/30 to-indigo-200/40 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold tracking-wide uppercase mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Enterprise Full-Stack Invoicing & Management
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#0f172a] tracking-tight max-w-4xl mx-auto leading-[1.12]">
          Precision Electrical Billing for <span className="text-[#2563EB]">Shree Shakti Electric</span>
        </h1>

        <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto mt-5 leading-relaxed font-normal">
          Designed for high-throughput electrical retailers, wholesale distributors, and electrical contractor operations.
          Full Indian GST engine, instant A4 PDF invoice printing, and synchronized dual-manager multi-computer access.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/login')}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto font-bold px-8 shadow-xl shadow-blue-500/25"
          >
            Access Manager Portal
          </Button>
        </div>

        {/* Live Mockup Presentation */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          <div className="rounded-2xl border-2 border-[#E8ECF3] bg-white shadow-2xl p-2 sm:p-4">
            <div className="bg-[#F8FAFC] border border-[#E8ECF3] rounded-xl p-4 sm:p-6 text-left">
              <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-500 ml-2">
                    shree-shakti-billing.lan/dashboard
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live MongoDB Synchronized
                </div>
              </div>

              {/* Sample Mini KPIs Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-white p-3.5 rounded-xl border border-[#E8ECF3]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Revenue</span>
                  <p className="text-lg font-black text-slate-900 mt-0.5">₹ 4,82,900.00</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E8ECF3]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Invoices</span>
                  <p className="text-lg font-black text-[#2563EB] mt-0.5">342 Invoices</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E8ECF3]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">This Month</span>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">₹ 1,18,450.00</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E8ECF3]">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Outstanding</span>
                  <p className="text-lg font-black text-rose-600 mt-0.5">₹ 28,100.00</p>
                </div>
              </div>

              {/* Sample Invoice Row */}
              <div className="bg-white border border-[#E8ECF3] rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#2563EB]">SE-2611-001</span>
                  <span className="font-bold text-slate-800">Patel Enterprises (GIDC Industrial)</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">₹ 10,480.00</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    PAID
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Capabilities */}
      <section className="py-20 px-6 lg:px-12 bg-white border-y border-[#E8ECF3]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Commercial-Grade Features
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Engineered for the daily operational requirements of electrical goods merchants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-[#E8ECF3] bg-[#F8FAFC]">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Two-Manager Concurrency</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Hiren and Suresh operate concurrently without conflicting invoice numbers. Dedicated atomic MongoDB sequence counters ensure 100% collision-free billing.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E8ECF3] bg-[#F8FAFC]">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Indian GST Engine</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Deterministic integer paise calculations for intra-state (CGST + SGST) and inter-state (IGST). Automatic HSN handling and conversion to Indian currency words.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#E8ECF3] bg-[#F8FAFC]">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">A4 PDF Invoice Engine</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Server-side Puppeteer generation with full print borders, authentic business logo, authorized manager signature mapping, and client receipt copies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-white text-center border-t border-[#E8ECF3]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#2563EB]" />
            <span className="text-xs font-bold text-slate-900 uppercase">Shree Shakti Electric</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Shree Shakti Billing &bull; All Rights Reserved &bull; Rajkot, Gujarat
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate('/login')}>
            Manager Portal &rarr;
          </Button>
        </div>
      </footer>
    </div>
  );
};
