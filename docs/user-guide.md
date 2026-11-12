# SHREE SHAKTI BILLING — Manager User Guide

Welcome to **Shree Shakti Billing**, the comprehensive management software for **Shree Shakti Electric**.

---

## 1. Manager Authentication

1. Open your browser and go to `http://localhost:5173` (or the LAN IP address).
2. Choose your manager account:
   - **Hiren** (PIN: `3112` initially)
   - **Suresh** (PIN: `1975` initially)
3. Enter your security PIN and click **Sign In**.
4. You will arrive at the live Business Dashboard.

---

## 2. Creating an Invoice (3-Step Wizard)

Click **Create Invoice** in the left sidebar or top right:

### Step 1: Customer Details
- Start typing in the customer search bar to pick an existing buyer.
- Or type a new customer's name, phone, address, and GSTIN.
- Click **+ Quick Add Client** if you want to store them permanently into the directory.
- Verify the **Invoice Date** (default: today).
- Select **Place of Supply** (`Gujarat` for CGST+SGST, or other state for IGST).
- Click **Continue to Items & Pricing**.

### Step 2: Items & Pricing
- Click the product name input to type or select common electrical goods from the quick catalog chips.
- Enter the **Quantity** and select the **Unit** (Nos, Pcs, Mtr, Coil, Set, Box).
- Adjust the **Rate (₹)**.
- Select the applicable **GST %** (0%, 5%, 12%, 18%, 28%).
- Watch the live subtotal, GST split, and grand total calculate dynamically.
- Click **Add Another Item** to add additional rows.
- Click **Review Invoice Preview**.

### Step 3: Review & Finalize
- Inspect the printable A4 invoice replica.
- If the customer paid immediately, enter the **Amount Received** (or click **Mark Full**).
- Click **Generate Invoice & Create PDF**.
- You will see celebratory confetti and an instant download/print dialog!

---

## 3. Managing Invoices & Recording Subsequent Payments

1. Go to **Invoice History** in the sidebar.
2. Use the search box to find bills by customer name, phone, or invoice number (e.g. `SE-2611-001`).
3. Filter by **Paid**, **Partially Paid**, or **Unpaid**.
4. Actions on each row:
   - **Eye icon**: Opens an interactive modal with the full embedded PDF document preview.
   - **Download icon**: Downloads the high-resolution A4 `.pdf` document.
   - **Printer icon**: Opens the browser print dialog immediately.
   - **Credit Card icon**: Opens a payment dialog to log cash, UPI, or bank transfer payments against an unpaid invoice.

---

## 4. Customer Directory

- View all clients, total lifetime purchases, and current unpaid credit balance.
- Click the **Eye icon** next to any customer to open their complete historical purchase ledger.
- Add or edit customer contact information at any time.

---

## 5. Electrical Catalog Management

- Browse the standard stock items (modular switches, sockets, wire coils, LED lighting).
- Add new items with selling rates, purchase costs, and tax percentages.
- Editing catalog prices will **never** alter prices on past historical invoices.

---

## 6. Financial Reports & CSV Export

- Visit **Reports & Analytics** to see sales trends (daily, monthly, yearly).
- Review top-purchasing clients and top-selling electrical products.
- Click **Export All Invoices (CSV)** to download a spreadsheet for tax auditing and accounting.

---

## 7. Business Settings & Password Management

- Go to **Settings** to update shop phone numbers, bank account details, and GSTIN.
- Switch to the **Manager Security** tab to change your manager PIN or password.
