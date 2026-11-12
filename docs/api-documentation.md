# SHREE SHAKTI BILLING — API Documentation

Base URL: `/api/v1`

All responses follow the unified JSON structure:
```json
{
  "success": true,
  "data": {},
  "message": "Optional feedback message",
  "pagination": { "page": 1, "limit": 25, "total": 100, "totalPages": 4 }
}
```

---

## 1. Authentication Endpoints (`/auth`)

### `POST /api/v1/auth/login`
Authenticates an authorized manager and establishes a server session.
- **Rate Limit**: 20 requests per 15 minutes per IP.
- **Request Body**:
  ```json
  {
    "username": "hiren",
    "password": "PIN"
  }
  ```
- **Response**: `200 OK` with manager profile and session cookie (`connect.sid`).

### `POST /api/v1/auth/logout`
Destroys the current server session and clears cookie. Requires active session.

### `GET /api/v1/auth/me`
Retrieves currently logged-in manager session information.

### `POST /api/v1/auth/change-password`
Updates the authenticated manager's security password or PIN.

---

## 2. Dashboard Endpoints (`/dashboard`)

### `GET /api/v1/dashboard/summary`
Returns real-time database-backed financial metrics:
- Lifetime revenue, monthly revenue, invoice counts
- Paid vs. unpaid vs. partially paid ratios
- Outstanding collection balances
- Recent invoices and payments feeds
- Daily and monthly sales chart series

---

## 3. Customer Endpoints (`/customers`)

### `GET /api/v1/customers`
- **Query Params**: `page`, `limit`, `search`
- Returns paginated active customers enriched with purchase count and outstanding amounts.

### `GET /api/v1/customers/:id`
Returns customer profile and complete historical invoice list.

### `POST /api/v1/customers`
Creates a new customer.
- **Body**: `name`, `mobile`, `email`, `billingAddress`, `city`, `state`, `pinCode`, `gstin`, `notes`

### `PATCH /api/v1/customers/:id`
Updates customer profile. Historical invoices remain protected.

### `DELETE /api/v1/customers/:id`
Soft-deactivates the customer record.

---

## 4. Product Catalog Endpoints (`/products`)

### `GET /api/v1/products`
- **Query Params**: `page`, `limit`, `search`, `category`
- Returns electrical products and services.

### `POST /api/v1/products`
Adds a product to the catalog.
- **Body**: `name`, `sku`, `description`, `category`, `unit`, `sellingPrice`, `purchasePrice`, `taxRate`, `hsn`

### `PATCH /api/v1/products/:id`
Modifies catalog rates or details. Past invoices maintain historic pricing.

### `DELETE /api/v1/products/:id`
Soft-deactivates the product.

---

## 5. Invoice Endpoints (`/invoices`)

### `POST /api/v1/invoices`
Creates a new GST tax invoice.
- **Calculations**: Backend recalculates all prices, discounts, CGST, SGST, IGST, and rounding.
- **Concurrency**: Generates atomic invoice number (`SE-yyMM-XXX`).
- **Signatory**: Automatically maps to authenticated manager's signature.
- **PDF**: Generates server-side A4 printable PDF via Puppeteer.
- **Initial Payment**: If `amountPaid > 0`, transactionally logs a payment receipt.

### `GET /api/v1/invoices`
- **Query Params**: `page`, `limit`, `search`, `paymentStatus`, `manager`, `startDate`, `endDate`
- Returns paginated invoices.

### `GET /api/v1/invoices/:id`
Returns invoice details with line items and linked payment records.

### `PATCH /api/v1/invoices/:id`
Updates an invoice. **Strictly preserves the original invoice number and ID.** Re-renders PDF.

### `DELETE /api/v1/invoices/:id`
Soft-archives invoice with full audit tracking.

### `GET /api/v1/invoices/:id/pdf`
Streams the actual generated A4 PDF file directly to browser with inline preview headers.

### `POST /api/v1/invoices/:id/regenerate-pdf`
Force regenerates the PDF file.

---

## 6. Payment Endpoints (`/payments`)

### `GET /api/v1/payments`
- **Query Params**: `page`, `limit`, `invoiceId`, `paymentMethod`, `startDate`, `endDate`
- Returns receipt transactions.

### `POST /api/v1/payments`
Records a payment against an invoice.
- **Body**: `invoiceId`, `amount`, `paymentMethod`, `referenceNumber`, `paymentDate`, `notes`
- **Validation**: Prevents overpayment exceeding current `balanceDue`.
- **Side Effect**: Transactionally updates invoice's `amountPaid`, `balanceDue`, and `paymentStatus`.

---

## 7. Reports & Export (`/reports`)

- `GET /api/v1/reports/sales` (grouped by daily, monthly, or yearly)
- `GET /api/v1/reports/customers` (customer sales ranking)
- `GET /api/v1/reports/products` (top-selling product breakdown)
- `GET /api/v1/reports/payments` (collection breakdown by payment channel)
- `GET /api/v1/reports/export-csv` (streams complete invoice dataset as RFC-4180 CSV file)

---

## 8. Business Settings & Audit (`/settings`, `/audit-logs`)

- `GET /api/v1/settings/business`: Shop coordinates, GSTIN, bank details, default terms.
- `PATCH /api/v1/settings/business`: Updates business settings.
- `GET /api/v1/audit-logs`: Searchable audit trail of manager actions.
