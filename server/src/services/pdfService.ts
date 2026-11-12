import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { IInvoice } from '../models/Invoice.js';
import { BusinessSettings } from '../models/BusinessSettings.js';
import { config } from '../config/index.js';
import { amountInWords, formatINR } from '../utils/amountInWords.js';
import { logger } from '../utils/logger.js';

function getAssetBase64(relativeAssetPath: string): string {
  try {
    const fullPath = path.resolve(process.cwd(), relativeAssetPath);
    if (fs.existsSync(fullPath)) {
      const bitmap = fs.readFileSync(fullPath);
      const ext = path.extname(fullPath).replace('.', '') || 'png';
      return `data:image/${ext};base64,${bitmap.toString('base64')}`;
    }
  } catch (e) {
    logger.warn({ err: e, path: relativeAssetPath }, 'Could not read asset for PDF');
  }
  return '';
}

export function buildInvoiceHtml(invoice: IInvoice, settings: any): string {
  const logoDataUri = getAssetBase64('src/assets/icons/app_icon.png');
  const signatureFile = invoice.managerUsername === 'hiren' ? 'hiren.png' : 'suresh.png';
  const signatureDataUri = getAssetBase64(`src/assets/images/${signatureFile}`);

  const hasHsn = invoice.items.some((i) => i.hsn && i.hsn.trim().length > 0);
  const words = amountInWords(invoice.grandTotal);

  const businessName = settings?.businessName || 'SHREE SHAKTI ELECTRIC';
  const tagline = settings?.tagline || 'Specialist in: All types of Electric Fitting, Wiring & Maintenance';
  const phone1 = settings?.phone1 || '+91 90336 60384';
  const phone2 = settings?.phone2 || '+91 70160 55176';
  const address = settings?.address || 'Shreeji Complex, Main Bazar, Rajkot';
  const gstin = settings?.gstin || '';
  const bankName = settings?.bankName || 'State Bank of India';
  const accountNumber = settings?.accountNumber || '';
  const ifscCode = settings?.ifscCode || '';
  const upiId = settings?.upiId || '';

  const termsList =
    invoice.terms && invoice.terms.length > 0
      ? invoice.terms
      : settings?.invoiceTerms || [
          'E & O.E',
          '1. Goods once sold will not be taken back.',
          '2. Guarantee / warranty as per manufacturer policy.',
          '3. Subject to local jurisdiction only.',
        ];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoice.invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 12mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #111827;
      background: #FFFFFF;
      font-size: 11px;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .invoice-container {
      width: 100%;
      border: 1.5px solid #1e293b;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      min-height: 268mm;
    }
    .top-meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f8fafc;
      border-bottom: 1px solid #1e293b;
      padding: 4px 10px;
      font-size: 9.5px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: #334155;
    }
    .company-header {
      padding: 10px 14px 8px;
      text-align: center;
      border-bottom: 1.5px solid #1e293b;
      background: #FFFFFF;
      position: relative;
    }
    .company-logo {
      position: absolute;
      left: 14px;
      top: 10px;
      width: 48px;
      height: 48px;
      object-fit: contain;
    }
    .company-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 1.2px;
      color: #0f172a;
      text-transform: uppercase;
    }
    .company-tagline {
      font-size: 10px;
      color: #475569;
      margin-top: 2px;
      font-weight: 500;
    }
    .company-contact {
      font-size: 10px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 3px;
    }
    .company-extra {
      font-size: 9px;
      color: #64748b;
      margin-top: 2px;
    }
    .details-box {
      display: flex;
      border-bottom: 1px solid #1e293b;
      background: #FFFFFF;
    }
    .details-col-left {
      flex: 1.1;
      border-right: 1px solid #1e293b;
      padding: 8px 12px;
    }
    .details-col-right {
      flex: 0.9;
      padding: 8px 12px;
    }
    .box-title {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0f172a;
      margin-bottom: 5px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 2px;
    }
    .detail-row {
      display: flex;
      margin-bottom: 3px;
      font-size: 10px;
    }
    .detail-label {
      width: 95px;
      color: #64748b;
      font-weight: 500;
    }
    .detail-val {
      flex: 1;
      color: #0f172a;
      font-weight: 600;
    }
    /* Item Table */
    .table-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th {
      background-color: #f1f5f9;
      border-bottom: 1.5px solid #1e293b;
      border-right: 1px solid #cbd5e1;
      padding: 6px 6px;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #1e293b;
      text-align: left;
    }
    th:last-child {
      border-right: none;
    }
    td {
      padding: 5px 6px;
      font-size: 10px;
      border-right: 1px solid #e2e8f0;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      color: #1e293b;
    }
    td:last-child {
      border-right: none;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .item-desc {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 1px;
    }

    /* Summary & Totals */
    .summary-section {
      border-top: 1.5px solid #1e293b;
      border-bottom: 1px solid #1e293b;
      display: flex;
      background: #FFFFFF;
    }
    .summary-left {
      flex: 1;
      border-right: 1px solid #1e293b;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .summary-right {
      width: 250px;
      padding: 6px 12px;
    }
    .words-block {
      margin-bottom: 6px;
    }
    .words-title {
      font-size: 9px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
    }
    .words-text {
      font-size: 10px;
      font-weight: 700;
      color: #0f172a;
      font-style: italic;
      margin-top: 2px;
    }
    .bank-block {
      background: #f8fafc;
      padding: 5px 8px;
      border-radius: 4px;
      border: 1px dashed #cbd5e1;
      font-size: 9px;
    }
    .bank-title {
      font-weight: 700;
      color: #334155;
      margin-bottom: 2px;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      padding: 2px 0;
      font-size: 10px;
      color: #334155;
    }
    .sum-row.bold {
      font-weight: 700;
      color: #0f172a;
    }
    .sum-row.grand-total {
      border-top: 1.5px solid #0f172a;
      border-bottom: 1.5px solid #0f172a;
      margin-top: 4px;
      padding: 4px 0;
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      background: #eff6ff;
      padding-left: 4px;
      padding-right: 4px;
    }

    /* Bottom terms and signature */
    .bottom-box {
      display: flex;
      min-height: 95px;
      background: #FFFFFF;
    }
    .terms-col {
      flex: 1.2;
      border-right: 1px solid #1e293b;
      padding: 8px 12px;
    }
    .terms-title {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .term-item {
      font-size: 8.5px;
      color: #475569;
      margin-bottom: 2px;
      line-height: 1.25;
    }
    .signature-col {
      flex: 0.8;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
    }
    .sig-for {
      font-size: 9.5px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
    }
    .sig-image-box {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sig-img {
      max-height: 44px;
      max-width: 140px;
      object-fit: contain;
    }
    .sig-line {
      width: 140px;
      border-bottom: 1px solid #1e293b;
      margin-bottom: 3px;
    }
    .sig-label {
      font-size: 9px;
      font-weight: 700;
      color: #334155;
    }
    .manager-name {
      font-size: 8.5px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Top Bar -->
    <div class="top-meta-bar">
      <span>TAX INVOICE</span>
      <span>GST / RETAIL BILL OF SUPPLY</span>
      <span>ORIGINAL FOR RECIPIENT</span>
    </div>

    <!-- Company Header -->
    <div class="company-header">
      ${logoDataUri ? `<img class="company-logo" src="${logoDataUri}" alt="Logo" />` : ''}
      <div class="company-title">${businessName}</div>
      <div class="company-tagline">${tagline}</div>
      <div class="company-contact">Phone: ${phone1} ${phone2 ? `, ${phone2}` : ''} | Address: ${address}</div>
      ${gstin ? `<div class="company-extra">GSTIN: <strong>${gstin}</strong> | State: Gujarat (24)</div>` : ''}
    </div>

    <!-- Billing & Invoice Details -->
    <div class="details-box">
      <div class="details-col-left">
        <div class="box-title">Billed To (Customer Details)</div>
        <div class="detail-row">
          <span class="detail-label">Customer Name:</span>
          <span class="detail-val">${invoice.customer.name || 'CASH CUSTOMER'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Mobile Number:</span>
          <span class="detail-val">${invoice.customer.mobile || 'N/A'}</span>
        </div>
        ${
          invoice.customer.billingAddress
            ? `<div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-val">${invoice.customer.billingAddress}${invoice.customer.city ? `, ${invoice.customer.city}` : ''}</span>
              </div>`
            : ''
        }
        ${
          invoice.customer.gstin
            ? `<div class="detail-row">
                <span class="detail-label">Customer GSTIN:</span>
                <span class="detail-val">${invoice.customer.gstin}</span>
              </div>`
            : ''
        }
        <div class="detail-row">
          <span class="detail-label">Place of Supply:</span>
          <span class="detail-val">${invoice.placeOfSupply || 'Gujarat (24)'}</span>
        </div>
      </div>

      <div class="details-col-right">
        <div class="box-title">Invoice Information</div>
        <div class="detail-row">
          <span class="detail-label">Invoice Number:</span>
          <span class="detail-val" style="color: #2563eb; font-size: 11px;">${invoice.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Invoice Date:</span>
          <span class="detail-val">${invoice.date}</span>
        </div>
        ${
          invoice.dueDate
            ? `<div class="detail-row">
                <span class="detail-label">Due Date:</span>
                <span class="detail-val">${invoice.dueDate}</span>
              </div>`
            : ''
        }
        <div class="detail-row">
          <span class="detail-label">Payment Status:</span>
          <span class="detail-val" style="color: ${
            invoice.paymentStatus === 'PAID'
              ? '#16a34a'
              : invoice.paymentStatus === 'PARTIAL'
              ? '#d97706'
              : '#dc2626'
          };">${invoice.paymentStatus}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issued By:</span>
          <span class="detail-val">${invoice.managerName || invoice.managerUsername.toUpperCase()}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 32px;" class="text-center">#</th>
            <th style="width: auto;">Item Description</th>
            ${hasHsn ? '<th style="width: 55px;" class="text-center">HSN/SAC</th>' : ''}
            <th style="width: 45px;" class="text-center">Qty</th>
            <th style="width: 45px;" class="text-center">Unit</th>
            <th style="width: 70px;" class="text-right">Rate</th>
            <th style="width: 55px;" class="text-center">GST %</th>
            <th style="width: 80px;" class="text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items
            .map(
              (item, i) => `
            <tr>
              <td class="text-center">${i + 1}</td>
              <td>
                <strong>${item.name}</strong>
                ${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
              </td>
              ${hasHsn ? `<td class="text-center">${item.hsn || '-'}</td>` : ''}
              <td class="text-center">${item.quantity}</td>
              <td class="text-center">${item.unit || 'Nos'}</td>
              <td class="text-right">${item.rate.toFixed(2)}</td>
              <td class="text-center">${item.gstRate || 0}%</td>
              <td class="text-right"><strong>${item.totalAmount.toFixed(2)}</strong></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Financial Summary -->
    <div class="summary-section">
      <div class="summary-left">
        <div class="words-block">
          <div class="words-title">Amount in Words:</div>
          <div class="words-text">${words}</div>
        </div>

        ${
          bankName && accountNumber
            ? `
          <div class="bank-block">
            <div class="bank-title">Bank Transfer & UPI Details:</div>
            <div>Bank: <strong>${bankName}</strong> | A/C: <strong>${accountNumber}</strong> | IFSC: <strong>${ifscCode}</strong></div>
            ${upiId ? `<div>UPI ID: <strong>${upiId}</strong></div>` : ''}
          </div>
        `
            : ''
        }
      </div>

      <div class="summary-right">
        <div class="sum-row">
          <span>Subtotal (Gross):</span>
          <span>${formatINR(invoice.subtotal)}</span>
        </div>
        ${
          invoice.totalDiscount > 0
            ? `
          <div class="sum-row" style="color: #16a34a;">
            <span>Discount:</span>
            <span>- ${formatINR(invoice.totalDiscount)}</span>
          </div>
        `
            : ''
        }
        <div class="sum-row">
          <span>Taxable Amount:</span>
          <span>${formatINR(invoice.taxableAmount)}</span>
        </div>
        ${
          invoice.isInterState
            ? `
          <div class="sum-row">
            <span>IGST:</span>
            <span>${formatINR(invoice.totalIgst)}</span>
          </div>
        `
            : `
          <div class="sum-row">
            <span>CGST:</span>
            <span>${formatINR(invoice.totalCgst)}</span>
          </div>
          <div class="sum-row">
            <span>SGST:</span>
            <span>${formatINR(invoice.totalSgst)}</span>
          </div>
        `
        }
        ${
          invoice.roundOff !== 0
            ? `
          <div class="sum-row">
            <span>Round Off:</span>
            <span>${invoice.roundOff > 0 ? '+' : ''}${formatINR(invoice.roundOff)}</span>
          </div>
        `
            : ''
        }
        <div class="sum-row grand-total">
          <span>Grand Total:</span>
          <span>${formatINR(invoice.grandTotal)}</span>
        </div>
        <div class="sum-row" style="margin-top: 3px;">
          <span>Amount Paid:</span>
          <span style="font-weight: 700; color: #16a34a;">${formatINR(invoice.amountPaid)}</span>
        </div>
        <div class="sum-row bold" style="color: ${invoice.balanceDue > 0 ? '#dc2626' : '#16a34a'};">
          <span>Balance Due:</span>
          <span>${formatINR(invoice.balanceDue)}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Box: Terms & Signature -->
    <div class="bottom-box">
      <div class="terms-col">
        <div class="terms-title">Terms & Conditions:</div>
        ${termsList.map((t: string) => `<div class="term-item">${t}</div>`).join('')}
        ${invoice.notes ? `<div class="term-item" style="margin-top: 4px; font-style: italic;"><strong>Note:</strong> ${invoice.notes}</div>` : ''}
      </div>

      <div class="signature-col">
        <div class="sig-for">For, ${businessName}</div>
        <div class="sig-image-box">
          ${signatureDataUri ? `<img class="sig-img" src="${signatureDataUri}" alt="Signature" />` : ''}
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-label">Authorized Signatory</div>
          <div class="manager-name">(${invoice.managerName || invoice.managerUsername.toUpperCase()})</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function getBrowserExecutablePath(): string | undefined {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const commonPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

/**
 * Generates an actual A4 PDF document using Puppeteer and writes to storage.
 */
export async function generateInvoicePdf(invoice: IInvoice): Promise<{ pdfPath: string; pdfUrl: string }> {
  try {
    const settings = await BusinessSettings.findOne().lean();
    const html = buildInvoiceHtml(invoice, settings);

    const storageDir = config.pdfStorageDir;
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }

    const filename = `${invoice.invoiceNumber}.pdf`;
    const outputPath = path.join(storageDir, filename);

    const executablePath = getBrowserExecutablePath();

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '12mm',
          bottom: '10mm',
          left: '12mm',
        },
      });
    } finally {
      await browser.close();
    }

    const pdfUrl = `/api/v1/invoices/${invoice._id}/pdf`;
    logger.info({ invoiceNumber: invoice.invoiceNumber, outputPath }, 'Invoice PDF generated successfully');

    return { pdfPath: outputPath, pdfUrl };
  } catch (error) {
    logger.error({ err: error, invoiceNumber: invoice.invoiceNumber }, 'Failed to generate invoice PDF');
    throw error;
  }
}
