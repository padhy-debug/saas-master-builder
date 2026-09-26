/**
 * Universal SaaS Document & Invoice Print Renderer
 * Handles digital letterheads, pre-printed stationery margins, multi-tax breakdowns, and print CSS.
 */

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
}

export interface InvoiceConfig {
  organizationName: string;
  organizationAddress: string;
  taxRegistrationNumber: string; // GSTIN / VAT / EIN
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerAddress: string;
  items: InvoiceItem[];
  currencySymbol?: string;
  usePreprintedLetterhead?: boolean;
  letterheadTopMarginMm?: number;
  letterheadBottomMarginMm?: number;
  notes?: string;
}

export function renderInvoiceHtml(config: InvoiceConfig): string {
  const currency = config.currencySymbol || '$';
  let subtotal = 0;
  let totalTax = 0;

  const rowsHtml = config.items
    .map((item, index) => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineTax = (lineTotal * item.taxPercent) / 100;
      subtotal += lineTotal;
      totalTax += lineTax;

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>${item.description}</strong></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currency}${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.taxPercent}%</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${currency}${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');

  const grandTotal = subtotal + totalTax;
  const topMargin = config.usePreprintedLetterhead ? `${config.letterheadTopMarginMm || 45}mm` : '15mm';
  const bottomMargin = config.usePreprintedLetterhead ? `${config.letterheadBottomMarginMm || 30}mm` : '15mm';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${config.invoiceNumber}</title>
  <style>
    @media print {
      @page {
        size: A4 portrait;
        margin-top: ${topMargin};
        margin-bottom: ${bottomMargin};
        margin-left: 15mm;
        margin-right: 15mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1f2937;
      line-height: 1.5;
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f9fafb; padding: 10px; text-align: left; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; }
    .digital-header { ${config.usePreprintedLetterhead ? 'display: none;' : ''} margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; }
  </style>
</head>
<body>
  ${
    !config.usePreprintedLetterhead
      ? `
  <div class="digital-header">
    <h1 style="margin: 0; color: #1e3a8a;">${config.organizationName}</h1>
    <p style="margin: 4px 0; color: #4b5563;">${config.organizationAddress}</p>
    <p style="margin: 2px 0; font-size: 13px; color: #6b7280;">Tax Registration: ${config.taxRegistrationNumber}</p>
  </div>
  `
      : ''
  }

  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <div>
      <h3 style="margin: 0 0 5px 0;">Bill To:</h3>
      <strong>${config.customerName}</strong>
      <p style="margin: 0; color: #4b5563;">${config.customerAddress}</p>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0; color: #2563eb;">INVOICE</h2>
      <p style="margin: 2px 0;"><strong>Invoice #:</strong> ${config.invoiceNumber}</p>
      <p style="margin: 2px 0; color: #6b7280;"><strong>Date:</strong> ${config.invoiceDate}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px;">#</th>
        <th>Item / Description</th>
        <th style="text-align: center; width: 60px;">Qty</th>
        <th style="text-align: right; width: 100px;">Rate</th>
        <th style="text-align: right; width: 70px;">Tax</th>
        <th style="text-align: right; width: 110px;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div style="display: flex; justify-content: flex-end; margin-top: 25px;">
    <div style="width: 280px; font-size: 14px;">
      <div style="display: flex; justify-content: space-between; padding: 6px 0;">
        <span>Subtotal:</span>
        <span>${currency}${subtotal.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
        <span>Estimated Tax:</span>
        <span>${currency}${totalTax.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 18px; font-weight: 700; color: #1e40af;">
        <span>Grand Total:</span>
        <span>${currency}${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  </div>

  ${config.notes ? `<p style="margin-top: 30px; font-size: 12px; color: #6b7280;"><strong>Notes:</strong> ${config.notes}</p>` : ''}
</body>
</html>
  `;
}
