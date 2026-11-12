# SHREE SHAKTI BILLING
### Premium Full-Stack Business Billing & Management System
**Client / Business:** SHREE SHAKTI ELECTRIC (Rajkot, Gujarat)  
**Specialization:** All types of Electric Fitting, Wiring & Maintenance

---

## ⚡ Overview

**Shree Shakti Billing** is a commercial enterprise billing and financial management system designed for electrical equipment wholesalers, retailers, and electrical service contractors. The system replaces isolated prototypes with a multi-user central architecture that allows two authorized managers (**Hiren** and **Suresh**) to work concurrently across local network computers connected to a shared central MongoDB database.

---

## 🚀 Key Highlights & Capabilities

- **Two-Manager Concurrency Governance:** Strict two-account model (`hiren` and `suresh`) with no public signup. Each invoice and payment is attributed to the authenticated manager session with their authentic signature.
- **Atomic Invoice Sequence Engine:** Unique `SE-yyMM-XXX` billing sequence generated atomically in MongoDB, eliminating duplicate invoice numbers even when managers create bills at the exact same millisecond.
- **Indian GST Billing Engine:** Robust, deterministic integer paise calculation service supporting intra-state (`CGST + SGST`) and inter-state (`IGST`), HSN codes, discounts, round-offs, and automatic Indian amount-in-words conversion.
- **Server-Side Puppeteer A4 PDF Engine:** Generates genuine, high-resolution A4 PDF tax invoices with printable borders, company branding, and authorized signature.
- **Live Business Intelligence Dashboard:** Real-time KPI summaries, monthly and daily sales trends, payment method breakdowns, and top-selling products via Recharts.
- **Customer & Catalog Management:** Comprehensive customer directory with lifetime purchase summaries and credit balances; electrical product catalog with instant rate population during billing.
- **Payment Collection Ledger:** Multi-channel payment recording (Cash, UPI, Bank Transfer, Cheque) with overpayment prevention and automatic invoice balance adjustment.
- **Security & Audit Logs:** Server-side sessions with `connect-mongo`, `HttpOnly` cookies, rate limiting, Bcrypt hashing, Helmet protection, and immutable audit logs.
- **Luxury White Design System:** Clean modern SaaS aesthetic with white cards, Inter typography tokens, Framer Motion transitions, and responsive desktop/tablet/mobile layouts.

---

## 🛠️ Technology Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript (Strict Mode), Vite, Tailwind CSS, Framer Motion, GSAP, Recharts, Lucide React, TanStack Query, Axios, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, Zod, Bcrypt, Express-Session, Connect-Mongo, Helmet, CORS, Express-Rate-Limit, Pino Logger |
| **Database** | MongoDB 8.0+ |
| **PDF Generation**| Server-Side Puppeteer / Chromium with custom HTML/CSS print template |
| **Testing** | Node.js Test Runner (`node:test`), Supertest |

---

## 📁 Repository Structure

```
shree-shakti-billing/
├── client/                     # Vite + React Frontend
│   ├── public/assets/          # Logos & manager signature assets
│   ├── src/
│   │   ├── components/         # Button, Card, Input, Modal, Badge
│   │   ├── features/
│   │   │   ├── auth/           # Two-Manager Login & Session Guard
│   │   │   ├── dashboard/      # Analytics & KPI overview
│   │   │   ├── invoices/       # 3-Step Wizard & History
│   │   │   ├── customers/      # Customer management
│   │   │   ├── products/       # Electrical catalog
│   │   │   ├── payments/       # Payment records & receipts
│   │   │   ├── reports/        # Sales & financial reporting
│   │   │   ├── settings/       # Business profile & manager PIN
│   │   │   ├── activity/       # Security audit logs
│   │   │   ├── about/          # System specs & LAN guide
│   │   │   └── landing/        # Public product showcase
│   │   ├── layouts/            # Sidebar & Top Navbar
│   │   ├── lib/                # Indian currency & GST calculations
│   │   └── services/           # Axios API Client
│   └── package.json
│
├── server/                     # Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Environment & MongoDB connection
│   │   ├── controllers/        # REST route handlers
│   │   ├── middleware/         # Auth guard, rate limiter, error handler
│   │   ├── models/             # Mongoose schemas (Manager, Customer, Invoice, etc.)
│   │   ├── routes/             # API v1 endpoints
│   │   ├── services/           # GST calculation, invoice numbering, Puppeteer PDF
│   │   ├── scripts/            # Database seeder
│   │   └── server.ts           # Express server entry point
│   ├── storage/pdfs/           # Durable on-disk PDF documents
│   └── package.json
│
├── shared/types/               # Monorepo shared TypeScript contracts
├── docs/                       # Technical & Architectural Documentation
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-documentation.md
│   ├── deployment.md
│   ├── user-guide.md
│   └── qa-report.md
├── .env.example
├── package.json                # Root monorepo workspace configuration
└── README.md
```

---

## ⚡ Quickstart & Installation

### Prerequisites
- Node.js (v20+ or v26+)
- MongoDB (running locally or accessible via URI)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Bill-MERN

# Install monorepo dependencies
npm.cmd install --prefix server
npm.cmd install --prefix client
```

### 2. Environment Configuration
Create `server/.env` based on `.env.example`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/shree_shakti_billing
SESSION_SECRET=shree_shakti_super_secret_session_key_2026
HIREN_INITIAL_PASSWORD=3112
SURESH_INITIAL_PASSWORD=1975
```

### 3. Seed Database
Initializes the two manager accounts (`hiren` and `suresh`), standard electrical catalog items, initial customers, and business profile:
```bash
npm.cmd run seed
```

### 4. Run Development Servers
```bash
# In terminal 1 (Backend API on http://localhost:5000)
npm.cmd run dev:server

# In terminal 2 (Frontend Client on http://localhost:5173)
npm.cmd run dev:client
```

---

## 👥 Authorized Manager Accounts

| Manager | Username | Default PIN | Authorized Signatory Asset |
|---|---|---|---|
| **Hiren** | `hiren` | `3112` | `hiren.png` |
| **Suresh** | `suresh` | `1975` | `suresh.png` |

---

## 🧪 Automated Testing

Run the automated test suite covering authentication, access control, concurrent invoice numbering, and Indian billing calculations:
```bash
npm.cmd test
```

Expected result:
```
✔ Authentication & API Access Control (5 tests)
✔ Indian Billing Calculation Engine (6 tests)
✔ Concurrent Invoice Number Generation (1 test)
ℹ tests 12 | pass 12 | fail 0 (100% Pass)
```

---

## 🌐 Local Network (LAN) Setup

To allow both Hiren and Suresh to work on separate computers simultaneously in the shop:
1. Ensure the server PC is on the office Wi-Fi/LAN and note its IP (e.g. `192.168.1.15`).
2. Start the server on the host machine.
3. Open a browser on the second manager's computer and go to:
   ```
   http://192.168.1.15:5173
   ```
4. Both managers can now issue invoices and record collections concurrently with central synchronization!

---

## 📄 License & Ownership
Proprietary software developed for **Shree Shakti Electric**, Rajkot, Gujarat.
