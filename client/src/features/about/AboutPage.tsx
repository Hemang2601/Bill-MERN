import React from 'react';
import {
  HelpCircle,
  Server,
  Database,
  ShieldCheck,
  Cpu,
  Globe,
  FileText,
  Zap,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-[#111827] tracking-tight">
          About Shree Shakti Billing
        </h2>
        <p className="text-xs text-[#64748B] mt-0.5">
          Commercial Enterprise Electrical Billing & Business Management System
        </p>
      </div>

      {/* Hero Overview */}
      <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#0EA5E9] p-2 flex items-center justify-center shrink-0 shadow-md">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Shree Shakti Electric &bull; Billing Suite</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Designed specifically for commercial electrical supply, contractor invoicing, and retail supply operations.
              Supports synchronized multi-manager operations across local networks with centralized MongoDB storage,
              high-precision Indian GST calculation engines, and A4 PDF printing.
            </p>
          </div>
        </div>
      </Card>

      {/* System Specifications */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase">
            <Server className="w-4 h-4" />
            <span>Architecture & Technology</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><strong>Frontend:</strong> React 18, TypeScript Strict, Vite, Tailwind CSS</li>
            <li><strong>Animation:</strong> Framer Motion, GSAP, Canvas Confetti</li>
            <li><strong>Backend:</strong> Node.js, Express.js, TypeScript, Session Auth</li>
            <li><strong>Database:</strong> MongoDB 8+ with Atomic Counter Allocation</li>
            <li><strong>PDF Engine:</strong> Server-side Puppeteer A4 print rendering</li>
          </ul>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Two-Manager Governance</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
            <li><strong>Authorized Manager 1:</strong> Hiren (Signatory: hiren.png)</li>
            <li><strong>Authorized Manager 2:</strong> Suresh (Signatory: suresh.png)</li>
            <li><strong>Password Storage:</strong> Salted Bcrypt / Argon2 hashes</li>
            <li><strong>Session Store:</strong> Server-side MongoDB Connect-Mongo</li>
            <li><strong>Concurrency:</strong> Atomic increment counters (SE-yyMM-XXX)</li>
          </ul>
        </Card>
      </div>

      {/* Multi-Device LAN Deployment Guide */}
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase">
          <Globe className="w-4 h-4" />
          <span>Two-Manager Local Area Network (LAN) Operation</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          To allow both Hiren and Suresh to operate on separate computers simultaneously:
        </p>
        <ol className="text-xs text-slate-700 space-y-1 list-decimal list-inside bg-slate-50 p-3 rounded-xl border border-slate-200">
          <li>Run the backend server on the designated host machine (listening on <code>0.0.0.0:5000</code>).</li>
          <li>Find the host machine's local IP address (e.g. <code>192.168.1.15</code>).</li>
          <li>On the second manager computer, open the web browser and visit <code>http://192.168.1.15:5173</code>.</li>
          <li>Both managers can generate invoices and record payments with zero sequence conflicts.</li>
        </ol>
      </Card>
    </div>
  );
};
