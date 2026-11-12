# SHREE SHAKTI BILLING — Database Design Document

## 1. Overview
The persistence layer is powered by **MongoDB** with strict Mongoose schema enforcement, compound indexes, atomic transaction support where enabled, and historical document snapshotting.

---

## 2. Collections and Schema Specifications

### 2.1 `managers` Collection
Stores authorized manager profiles. Exactly two documents (`hiren` and `suresh`) are provisioned.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | MongoDB Unique ID |
| `username` | String | Unique, Indexed, Enum: `['hiren', 'suresh']` | Manager username |
| `displayName` | String | Required | Formatted name ('Hiren', 'Suresh') |
| `passwordHash` | String | Required | Salted Bcrypt / Argon2 hash |
| `signatureImage`| String | Required | Asset file (`hiren.png` / `suresh.png`) |
| `role` | String | Default: `'manager'` | Role identifier |
| `phone` | String | Optional | Contact phone number |
| `email` | String | Optional | Manager email |
| `isActive` | Boolean | Default: `true` | Account active status |
| `lastLogin` | Date | Optional | Timestamp of last session |
| `createdAt` | Date | Timestamp | Record creation |
| `updatedAt` | Date | Timestamp | Last update |

---

### 2.2 `customers` Collection
Directory of buyers and contractors with aggregated financial summaries.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Customer ID |
| `name` | String | Required, Indexed | Customer or company name |
| `mobile` | String | Required, Indexed | Contact phone number |
| `email` | String | Optional | Email address |
| `billingAddress`| String | Optional | Street / office address |
| `city` | String | Default: `'Rajkot'` | City |
| `state` | String | Default: `'Gujarat'`| State |
| `pinCode` | String | Optional | Postal code |
| `gstin` | String | Optional | 15-digit GST identification number |
| `notes` | String | Optional | Credit notes / preferences |
| `isActive` | Boolean | Default: `true`, Indexed | Soft deactivation flag |
| `createdAt` | Date | Timestamp | Creation timestamp |
| `updatedAt` | Date | Timestamp | Last update timestamp |

---

### 2.3 `products` Collection
Catalog of electrical equipment, wires, switches, lighting, and service items.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Product ID |
| `name` | String | Required, Indexed | Full product title |
| `sku` | String | Optional, Indexed | SKU / Product Code |
| `description` | String | Optional | Technical specifications |
| `category` | String | Required, Indexed | e.g. Switches, Wires, Lighting |
| `unit` | String | Enum: `['Nos', 'Pcs', 'Mtr', 'Coil', 'Set', 'Box', 'Pkt']` | Measurement unit |
| `sellingPrice` | Number | Required, Min: 0 | Default selling rate (₹) |
| `purchasePrice`| Number | Min: 0, Default: 0 | Cost price (₹) |
| `taxRate` | Number | Default: 18 | GST rate (0, 5, 12, 18, 28%) |
| `hsn` | String | Optional | HSN / SAC Code |
| `isActive` | Boolean | Default: `true`, Indexed | Active status |
| `createdAt` | Date | Timestamp | Created date |
| `updatedAt` | Date | Timestamp | Updated date |

---

### 2.4 `invoices` Collection
Financial tax invoices. Crucially includes an embedded `customer` snapshot schema to protect historical records against profile modifications.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Invoice ID |
| `invoiceNumber`| String | Unique, Indexed | Format: `SE-yyMM-XXX` |
| `date` | String | Required, Indexed | YYYY-MM-DD |
| `dueDate` | String | Optional | YYYY-MM-DD |
| `placeOfSupply`| String | Default: `'Gujarat (24)'` | Place of supply |
| `isInterState` | Boolean | Default: `false` | Intra vs. Inter-state toggle |
| `customer` | Object | Subdocument | **Immutable snapshot** of customer at billing time |
| `items` | Array | Subdocument[] | Line items with quantity, rate, tax, amounts |
| `subtotal` | Number | Min: 0 | Gross subtotal before discount |
| `totalDiscount`| Number | Min: 0 | Total discount amount |
| `taxableAmount`| Number | Min: 0 | Taxable base value |
| `totalCgst` | Number | Min: 0 | CGST amount (Intra-state) |
| `totalSgst` | Number | Min: 0 | SGST amount (Intra-state) |
| `totalIgst` | Number | Min: 0 | IGST amount (Inter-state) |
| `totalTax` | Number | Min: 0 | Cumulative GST amount |
| `roundOff` | Number | Default: 0 | Adjustment to nearest integer rupee |
| `grandTotal` | Number | Required, Indexed | Final payable invoice amount |
| `amountPaid` | Number | Default: 0 | Settled payment amount |
| `balanceDue` | Number | Required, Indexed | Remaining outstanding balance |
| `paymentStatus`| String | Enum: `['PAID', 'PARTIAL', 'UNPAID']` | Payment state |
| `managerId` | ObjectId | Ref: Manager | Authenticated manager ID |
| `managerUsername`| String | Enum: `['hiren', 'suresh']` | Manager username |
| `managerName` | String | Required | Manager display name |
| `managerSignature`| String | Required | Signature image filename |
| `pdfPath` | String | Optional | On-disk PDF absolute path |
| `pdfUrl` | String | Optional | Relative download endpoint |
| `status` | String | Enum: `['ACTIVE', 'ARCHIVED']` | Soft archival flag |
| `createdAt` | Date | Timestamp | Document creation timestamp |
| `updatedAt` | Date | Timestamp | Document update timestamp |

---

### 2.5 `payments` Collection
Transaction ledger for all customer receipts and payments.

| Field | Type | Attributes | Description |
|---|---|---|---|
| `_id` | ObjectId | Primary Key | Payment transaction ID |
| `invoiceId` | ObjectId | Ref: Invoice, Indexed | Target invoice ID |
| `invoiceNumber`| String | Indexed | e.g. `SE-2611-001` |
| `customerId` | ObjectId | Ref: Customer | Linked customer ID |
| `customerName` | String | Required | Customer name at payment time |
| `amount` | Number | Required, Min: 0.01 | Payment amount (₹) |
| `paymentMethod`| String | Enum: `['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'OTHER']` | Payment method |
| `referenceNumber`| String | Optional | UPI UTR / Bank NEFT / Cheque No. |
| `paymentDate` | String | Required, Indexed | YYYY-MM-DD |
| `notes` | String | Optional | Transaction remarks |
| `recordedBy` | Object | Subdocument | Manager ID, username, and display name |
| `createdAt` | Date | Timestamp | Receipt timestamp |

---

### 2.6 `counters` Collection
Atomic sequence generation for concurrency-safe invoice numbers.

| Field | Type | Description |
|---|---|---|
| `_id` | String | Sequence key (e.g. `invoice_seq_2611`) |
| `seq` | Number | Integer counter atomically incremented via `$inc` |

---

### 2.7 `businessSettings` Collection
Singleton document storing shop address, contact numbers, tax configuration, terms, and bank details.
