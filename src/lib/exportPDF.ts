/**
 * exportPDF.ts — Build a professional Arabic RTL PDF via html2canvas → jsPDF.
 *
 * NEVER uses jsPDF .text() for Arabic content (broken letter-shaping).
 * Instead the entire document is rendered as an HTML block (with correct RTL
 * Arabic font rendering by the browser), rasterised by html2canvas, then
 * sliced into A4 pages and embedded as images.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { groupLabelLabel } from '@/lib/groupLabels';
import { eventTypeLabel } from '@/lib/eventTypes';
import { rsvpStatusArabic, type ExportGuest } from '@/lib/guestIO';
import type { SiteSettings } from '@/hooks/useSiteSettings';
import type { Tables } from '@/types/database.types';

type EventRow = Tables<'events'>;

export interface PdfExportOptions {
  guests: (ExportGuest & { id: string })[];
  rsvpByGuestId: Record<string, string | null>;
  event: EventRow;
  settings: SiteSettings;
}

/** Wait for an image element to fully load (or resolve immediately if already loaded). */
function waitForImage(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) {
      resolve();
      return;
    }
    img.onload = () => resolve();
    img.onerror = () => resolve(); // resolve even on error — canvas will just show nothing
  });
}

function formatEventDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

/**
 * Builds a luxury Arabic RTL HTML block, captures it with html2canvas,
 * and downloads the result as a multi-page A4 PDF.
 */
export async function buildAndDownloadPDF(options: PdfExportOptions): Promise<void> {
  const { guests, rsvpByGuestId, event, settings } = options;

  // ---- Build offscreen container ----
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: '794px', // A4 at 96dpi ≈ 794px
    background: '#fffaf5',
    direction: 'rtl',
    fontFamily: '"Segoe UI", "Noto Naskh Arabic", "Arial", sans-serif',
    padding: '40px',
    boxSizing: 'border-box',
    color: '#1a1009',
  });

  // ---- Letterhead ----
  const brand = settings.brand_name ?? 'دعوتك';

  let logoHtml = '';
  if (settings.logo_url) {
    // Will be replaced by actual img element below for awaiting load
    logoHtml = `<div id="pdf-logo-placeholder" style="height:72px;display:flex;align-items:center;justify-content:flex-end;margin-bottom:8px;"></div>`;
  }

  const letterhead = `
    <div style="border-bottom:3px solid #b8933a;padding-bottom:20px;margin-bottom:24px;">
      ${logoHtml}
      <h1 style="font-size:28px;font-weight:900;margin:0 0 4px 0;color:#7c3517;letter-spacing:-0.5px;">${brand}</h1>
      ${settings.site_url ? `<p style="font-size:13px;color:#7c3517;margin:2px 0;" dir="ltr">${settings.site_url}</p>` : ''}
      <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:8px;font-size:12px;color:#5a4220;">
        ${settings.contact_phone ? `<span>📞 ${settings.contact_phone}</span>` : ''}
        ${settings.contact_email ? `<span>✉️ ${settings.contact_email}</span>` : ''}
        ${settings.whatsapp ? `<span>💬 واتساب: ${settings.whatsapp}</span>` : ''}
        ${settings.address ? `<span>📍 ${settings.address}</span>` : ''}
      </div>
    </div>
  `;

  // ---- Event info ----
  const eventSection = `
    <div style="margin-bottom:24px;padding:16px 20px;background:#fff6e8;border-radius:12px;border:1px solid #e6c97a;">
      <h2 style="font-size:20px;font-weight:900;margin:0 0 8px 0;color:#1a1009;">${event.title}</h2>
      <div style="display:flex;flex-wrap:wrap;gap:12px;font-size:13px;color:#5a4220;">
        <span>📅 ${formatEventDate(event.event_date)}</span>
        <span>🎉 ${eventTypeLabel(event.event_type)}</span>
        ${event.venue_name ? `<span>📍 ${event.venue_name}</span>` : ''}
      </div>
    </div>
  `;

  // ---- Guest table ----
  const tableRows = guests.map((g) => {
    const rsvpStatus = rsvpByGuestId[g.id] ?? null;
    return `
      <tr style="border-bottom:1px solid #f0e0b8;">
        <td style="padding:10px 12px;font-weight:700;">${g.full_name}</td>
        <td style="padding:10px 12px;font-family:monospace;font-size:12px;color:#5a4220;">
          <span dir="ltr" style="unicode-bidi:isolate;">${g.phone_e164 ?? '—'}</span>
        </td>
        <td style="padding:10px 12px;">${groupLabelLabel(g.group_label)}</td>
        <td style="padding:10px 12px;text-align:center;">${g.companions_allowed ?? 0}</td>
        <td style="padding:10px 12px;">${rsvpStatusArabic(rsvpStatus)}</td>
      </tr>
    `;
  }).join('');

  const table = `
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#7c3517;color:#fff;">
          <th style="padding:10px 12px;text-align:right;font-weight:900;">الاسم</th>
          <th style="padding:10px 12px;text-align:right;font-weight:900;">الجوال</th>
          <th style="padding:10px 12px;text-align:right;font-weight:900;">من طرف</th>
          <th style="padding:10px 12px;text-align:center;font-weight:900;">المرافقون</th>
          <th style="padding:10px 12px;text-align:right;font-weight:900;">حالة الرد</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  // ---- Footer ----
  const now = new Intl.DateTimeFormat('ar-SA', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date());

  const footer = `
    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e6c97a;font-size:11px;color:#9a7840;text-align:center;">
      صُدِّر بتاريخ ${now} · ${brand}
    </div>
  `;

  container.innerHTML = letterhead + eventSection + table + footer;
  document.body.appendChild(container);

  // ---- Await logo image load BEFORE html2canvas ----
  if (settings.logo_url) {
    const logoPlaceholder = container.querySelector('#pdf-logo-placeholder') as HTMLDivElement;
    if (logoPlaceholder) {
      const img = document.createElement('img');
      img.src = settings.logo_url;
      img.crossOrigin = 'anonymous';
      img.style.height = '64px';
      img.style.width = 'auto';
      img.style.objectFit = 'contain';
      logoPlaceholder.appendChild(img);
      await waitForImage(img);
    }
  }

  try {
    // ---- Capture with html2canvas ----
    const canvas = await html2canvas(container, {
      scale: 2, // Retina-quality
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#fffaf5',
      logging: false,
    });

    // ---- Build PDF (A4 portrait) ----
    const A4_WIDTH_MM = 210;
    const A4_HEIGHT_MM = 297;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = A4_WIDTH_MM;
    const imgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width;

    let yOffset = 0;

    while (yOffset < imgHeight) {
      if (yOffset > 0) pdf.addPage();

      pdf.addImage(
        canvas,
        'PNG',
        0,
        -yOffset,
        imgWidth,
        imgHeight,
      );

      yOffset += A4_HEIGHT_MM;
    }

    // ---- Download ----
    const slug = event.slug ?? event.title ?? 'guests';
    pdf.save(`${slug}_ضيوف.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
