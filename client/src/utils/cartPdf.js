// Builds a PDF of the cart (items, sizes, quantities, prices, total) in the browser
// and downloads it. Uses pdf-lib (free, open source, no server, no API key).
// pdf-lib is loaded only when the button is clicked, so the site stays fast.
import { formatPrice, stoneLabel } from './format.js';

// The built-in PDF fonts only know Latin characters: replace anything else.
const safe = (s = '') => String(s).replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');

export async function downloadCartPdf(lines, total) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const pdf = await PDFDocument.create();
  pdf.setTitle('Eden Jewelry - Cart');
  pdf.setAuthor('Eden Jewelry');
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28; // A4
  const H = 841.89;
  const M = 50;
  const dark = rgb(0.1, 0.1, 0.1);
  const grey = rgb(0.45, 0.45, 0.45);
  const line = rgb(0.85, 0.85, 0.85);
  const cols = [M, M + 50, M + 270, M + 330, M + 375, M + 445]; // code, item, size, qty, unit, total

  let page = pdf.addPage([W, H]);
  let y = H - M;

  const text = (t, x, size = 10, f = font, color = dark) => page.drawText(safe(t), { x, y, size, font: f, color });
  const right = (t, xRight, size = 10, f = font) => {
    const s = safe(t);
    page.drawText(s, { x: xRight - f.widthOfTextAtSize(s, size), y, size, font: f, color: dark });
  };
  const fit = (t, max, size = 10) => {
    let s = safe(t);
    while (s.length > 1 && font.widthOfTextAtSize(s, size) > max) s = s.slice(0, -2) + '.';
    return s;
  };
  const rule = () => page.drawLine({ start: { x: M, y: y - 6 }, end: { x: W - M, y: y - 6 }, thickness: 0.7, color: line });
  const header = () => {
    text('Code', cols[0], 9, bold, grey);
    text('Item', cols[1], 9, bold, grey);
    text('Size', cols[2], 9, bold, grey);
    text('Qty', cols[3], 9, bold, grey);
    right('Unit', cols[5] - 10, 9, bold);
    right('Total', W - M, 9, bold);
    rule();
    y -= 24;
  };

  // Title block
  text('Eden Jewelry', M, 22, bold);
  y -= 18;
  text('Handmade 925 silver - south Lebanon', M, 10, font, grey);
  y -= 30;
  text('Cart summary', M, 14, bold);
  right(new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }), W - M, 10);
  y -= 28;
  header();

  for (const l of lines) {
    if (y < M + 80) {
      page = pdf.addPage([W, H]);
      y = H - M;
      header();
    }
    text(l.code || '', cols[0]);
    text(fit(l.name, 210), cols[1]);
    text(l.size ?? '-', cols[2]);
    text(String(l.quantity), cols[3]);
    right(formatPrice(l.price), cols[5] - 10);
    right(formatPrice(l.price * l.quantity), W - M);
    y -= 13;
    text(fit(stoneLabel(l.stone), 210, 8), cols[1], 8, font, grey);
    rule();
    y -= 22;
  }

  y -= 4;
  text('Total', cols[3], 12, bold);
  right(formatPrice(total), W - M, 12, bold);
  y -= 30;
  text('All prices in USD. This is not an invoice: the workshop confirms every order by phone.', M, 8, font, grey);

  const bytes = await pdf.save();
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `eden-cart-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
