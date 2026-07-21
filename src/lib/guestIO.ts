/**
 * Guest Import / Export utilities.
 *
 * Pure logic — no React dependency. All DB-column names taken verbatim from
 * database.types.ts to avoid mismatches.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { groupLabelLabel, type GroupLabelValue } from '@/lib/groupLabels';

// ---------------------------------------------------------------------------
// Phone helpers
// ---------------------------------------------------------------------------

const PHONE_E164_RE = /^\+[1-9]\d{7,14}$/;

/**
 * Best-effort normalise a raw phone string to E.164.
 *
 * Returns `{ phone, status }`:
 *  - phone: the normalised value (or the cleaned input if we can't normalise)
 *  - status: 'valid' | 'empty' | 'invalid' | 'incomplete'
 *
 * Rules (per user spec):
 *  1) Already valid +E.164  → keep as-is.
 *  2) Leading "00"          → replace with "+"  → validate.
 *  3) Saudi local "05…"    → prepend "+966"  → validate.
 *  4) Everything else that doesn't start with "+" → 'incomplete' (could be
 *     Yemeni, Jordanian, etc. — we can't confidently guess the country code).
 */
export function normalizePhone(raw: string): {
  phone: string;
  status: 'valid' | 'empty' | 'invalid' | 'incomplete';
} {
  const cleaned = raw.replace(/[\s\u200B\u200C\u200D\u00A0\-().]/g, '');
  if (!cleaned) return { phone: '', status: 'empty' };

  // 1) Already starts with "+"
  if (cleaned.startsWith('+')) {
    return PHONE_E164_RE.test(cleaned)
      ? { phone: cleaned, status: 'valid' }
      : { phone: cleaned, status: 'invalid' };
  }

  // 2) Leading "00" → "+"
  if (cleaned.startsWith('00')) {
    const candidate = '+' + cleaned.slice(2);
    return PHONE_E164_RE.test(candidate)
      ? { phone: candidate, status: 'valid' }
      : { phone: candidate, status: 'invalid' };
  }

  // 3) Saudi local: starts with "05" and is 10 digits
  if (/^05\d{8}$/.test(cleaned)) {
    const candidate = '+966' + cleaned.slice(1); // drop the leading 0
    return { phone: candidate, status: 'valid' };
  }

  // 4) Saudi local without 0: starts with "5" and is 9 digits
  if (/^5\d{8}$/.test(cleaned)) {
    const candidate = '+966' + cleaned;
    return { phone: candidate, status: 'valid' };
  }

  // 5) Yemeni local: starts with "7" and is 9 digits (77, 71, 73, 70, etc.)
  if (/^7\d{8}$/.test(cleaned)) {
    const candidate = '+967' + cleaned;
    return { phone: candidate, status: 'valid' };
  }

  // 6) Any other bare number — we don't know the country code
  return { phone: cleaned, status: 'incomplete' };
}

// ---------------------------------------------------------------------------
// Side / group_label mapping
// ---------------------------------------------------------------------------

const GROOM_VARIANTS = new Set(['groom', 'العريس', 'عريس']);
const BRIDE_VARIANTS = new Set(['bride', 'العروس', 'عروس']);

export function mapSideToGroupLabel(raw: string): GroupLabelValue {
  const t = raw.trim().toLowerCase();
  if (!t) return 'other';
  if (GROOM_VARIANTS.has(t)) return 'groom';
  if (BRIDE_VARIANTS.has(t)) return 'bride';
  return 'other';
}

// ---------------------------------------------------------------------------
// Import row types
// ---------------------------------------------------------------------------

export type ImportRowStatus =
  | 'valid'
  | 'error_name'
  | 'error_phone'
  | 'incomplete_phone'
  | 'duplicate';

export interface ImportRow {
  /** 0-based index in the original file */
  index: number;
  name: string;
  phoneRaw: string;
  phoneNormalized: string;
  side: GroupLabelValue;
  companions: number;
  status: ImportRowStatus;
  errorDetail: string;
  selected: boolean;
}

// ---------------------------------------------------------------------------
// Header-flex mapping
// ---------------------------------------------------------------------------

type HeaderKey = 'name' | 'phone' | 'side' | 'companions';

const HEADER_MAP: Record<string, HeaderKey> = {
  // Arabic
  'الاسم': 'name',
  'الجوال': 'phone',
  'الهاتف': 'phone',
  'رقم الجوال': 'phone',
  'من طرف': 'side',
  'المرافقون': 'companions',
  'عدد المرافقين': 'companions',
  // English
  'name': 'name',
  'phone': 'phone',
  'side': 'side',
  'companions': 'companions',
};

function resolveHeaders(
  rawHeaders: string[],
): Record<HeaderKey, number | null> {
  const result: Record<HeaderKey, number | null> = {
    name: null,
    phone: null,
    side: null,
    companions: null,
  };

  for (let i = 0; i < rawHeaders.length; i++) {
    const h = rawHeaders[i].trim().toLowerCase();
    const key = HEADER_MAP[h];
    if (key && result[key] === null) {
      result[key] = i;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Parse import rows from a 2-D string array (header row + data rows)
// ---------------------------------------------------------------------------

function parseFromArrays(arrays: string[][]): ImportRow[] {
  if (arrays.length < 2) return [];

  const headerRow = arrays[0];
  const cols = resolveHeaders(headerRow);
  const rows: ImportRow[] = [];

  // Dedupe tracking — only non-empty phones
  const seenPhones = new Set<string>();

  for (let r = 1; r < arrays.length; r++) {
    const cells = arrays[r];
    // Skip completely empty rows
    if (cells.every((c) => !c.trim())) continue;

    const name = (cols.name !== null ? cells[cols.name] ?? '' : '').trim();
    const phoneRaw = (cols.phone !== null ? cells[cols.phone] ?? '' : '').trim();
    const sideRaw = (cols.side !== null ? cells[cols.side] ?? '' : '').trim();
    const compRaw = (cols.companions !== null ? cells[cols.companions] ?? '' : '').trim();

    const side = mapSideToGroupLabel(sideRaw);
    const companions = Math.max(0, Math.floor(Number(compRaw) || 0));
    const phoneResult = normalizePhone(phoneRaw);

    let status: ImportRowStatus = 'valid';
    let errorDetail = '';

    if (!name) {
      status = 'error_name';
      errorDetail = 'الاسم مفقود';
    } else if (phoneResult.status === 'invalid') {
      status = 'error_phone';
      errorDetail = 'رقم غير صالح';
    } else if (phoneResult.status === 'incomplete') {
      status = 'incomplete_phone';
      errorDetail = 'رقم غير مكتمل — أضف رمز الدولة';
    } else if (phoneResult.status === 'valid' && seenPhones.has(phoneResult.phone)) {
      status = 'duplicate';
      errorDetail = 'مكرر في الملف';
    }

    // Track phone for intra-file dedupe (only non-empty valid phones)
    if (phoneResult.status === 'valid' && phoneResult.phone) {
      seenPhones.add(phoneResult.phone);
    }

    rows.push({
      index: r - 1,
      name,
      phoneRaw,
      phoneNormalized: phoneResult.phone,
      side,
      companions,
      status,
      errorDetail,
      selected: status === 'valid',
    });
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Public: parse CSV string
// ---------------------------------------------------------------------------

export function parseCSV(csvText: string): ImportRow[] {
  // Strip UTF-8 BOM if present
  const text = csvText.replace(/^\uFEFF/, '');
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: true,
  });
  return parseFromArrays(result.data);
}

// ---------------------------------------------------------------------------
// Public: parse Excel buffer
// ---------------------------------------------------------------------------

export function parseExcel(buffer: ArrayBuffer): ImportRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const arrays: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
  });
  return parseFromArrays(arrays);
}

// ---------------------------------------------------------------------------
// Public: parse vCard (.vcf) string
// ---------------------------------------------------------------------------

function decodeQuotedPrintable(str: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '=' && i + 2 < str.length) {
      const hex = str.substring(i + 1, i + 3);
      if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
        bytes.push(parseInt(hex, 16));
        i += 2;
        continue;
      }
    }
    bytes.push(str.charCodeAt(i));
  }
  return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
}

function decodeBase64(str: string): string {
  try {
    const binStr = atob(str);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return str;
  }
}

/**
 * Parse a vCard file (vCard 2.1 / 3.0 / 4.0) into ImportRows.
 *
 * - Splits on BEGIN:VCARD boundaries.
 * - Name: FN: field; fallback = N: components joined (Family;Given;Middle;Prefix;Suffix).
 * - Phone: first TEL line found (handles TEL:+966…, TEL;TYPE=…:+966…, TEL;...:05…).
 * - side defaults to 'other', companions to 0.
 * - Empty phone is allowed (status 'valid' as long as name present).
 */
export function parseVCard(vcfText: string): ImportRow[] {
  // Normalise line endings
  let text = vcfText.replace(/\r\n|\r/g, '\n').replace(/^\uFEFF/, '');
  
  // 1) LINE UNFOLDING: handle quoted-printable soft breaks first (line ending with =)
  text = text.replace(/=\n/g, '');
  // Then standard unfolding: CRLF/LF followed by space or TAB continues the previous line
  text = text.replace(/\n[ \t]+/g, '');

  // Split into individual vCard blocks
  const blocks = text.split(/BEGIN:VCARD/i).map((b) => b.trim()).filter(Boolean);

  const rows: ImportRow[] = [];
  const seenPhones = new Set<string>();

  blocks.forEach((block, idx) => {
    const lines = block.split('\n');

    let fn = '';
    let n = '';
    let phones: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.toUpperCase().startsWith('END:VCARD')) continue;

      // Parse logical line as GROUP.PROPERTY;PARAM=VAL;PARAM:VALUE
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;
      
      const propGroup = line.slice(0, colonIdx);
      const rawValue = line.slice(colonIdx + 1);

      const propParts = propGroup.split(';');
      // Handle group prefix (e.g. item1.TEL)
      let propName = propParts[0].toUpperCase();
      if (propName.includes('.')) {
        propName = propName.split('.')[1];
      }

      // Check encodings
      let encoding = '';
      for (let i = 1; i < propParts.length; i++) {
        const param = propParts[i].toUpperCase();
        if (param === 'QUOTED-PRINTABLE' || param.startsWith('ENCODING=QUOTED-PRINTABLE')) {
          encoding = 'QUOTED-PRINTABLE';
        } else if (param === 'BASE64' || param === 'B' || param.startsWith('ENCODING=BASE64') || param.startsWith('ENCODING=B')) {
          encoding = 'BASE64';
        }
      }

      let value = rawValue;
      if (encoding === 'QUOTED-PRINTABLE') {
        value = decodeQuotedPrintable(value);
      } else if (encoding === 'BASE64') {
        value = decodeBase64(value);
      }

      if (propName === 'FN' && !fn) {
        fn = value.trim();
      } else if (propName === 'N' && !n) {
        const parts = value.split(';').map((p) => p.trim()).filter(Boolean);
        n = parts.join(' ');
      } else if (propName === 'TEL') {
        phones.push(value.trim());
      }
    }

    const name = fn || n;
    if (!name) return; // skip card if no name

    const phoneRaw = phones.find(p => p) || '';

    const side: GroupLabelValue = 'other';
    const companions = 0;
    const phoneResult = normalizePhone(phoneRaw);

    let status: ImportRowStatus = 'valid';
    let errorDetail = '';

    // phone can be empty, so only error if invalid or incomplete
    if (phoneResult.status === 'invalid') {
      status = 'error_phone';
      errorDetail = 'رقم غير صالح';
    } else if (phoneResult.status === 'incomplete') {
      status = 'incomplete_phone';
      errorDetail = 'رقم غير مكتمل — أضف رمز الدولة';
    } else if (phoneResult.status === 'valid' && phoneResult.phone && seenPhones.has(phoneResult.phone)) {
      status = 'duplicate';
      errorDetail = 'مكرر في الملف';
    }

    if (phoneResult.status === 'valid' && phoneResult.phone) {
      seenPhones.add(phoneResult.phone);
    }

    rows.push({
      index: idx,
      name,
      phoneRaw,
      phoneNormalized: phoneResult.phone,
      side,
      companions,
      status,
      errorDetail,
      selected: status === 'valid',
    });
  });

  return rows;
}

// ---------------------------------------------------------------------------
// Public: mark duplicates against existing guests in the event
// ---------------------------------------------------------------------------

/**
 * Mutates rows in-place: if a valid row's phone already exists in
 * `existingPhones`, set status to 'duplicate' and errorDetail.
 * Empty phones are never considered duplicates.
 */
export function markDuplicatesAgainstExisting(
  rows: ImportRow[],
  existingPhones: Set<string>,
): void {
  for (const row of rows) {
    if (
      row.status === 'valid' &&
      row.phoneNormalized &&
      existingPhones.has(row.phoneNormalized)
    ) {
      row.status = 'duplicate';
      row.errorDetail = 'مكرر — موجود في القائمة';
      row.selected = false;
    }
  }
}

// ---------------------------------------------------------------------------
// Export helpers
// ---------------------------------------------------------------------------

const RSVP_STATUS_ARABIC: Record<string, string> = {
  confirmed: 'مؤكد',
  declined: 'معتذر',
  pending: 'قيد الانتظار',
};

export function rsvpStatusArabic(status: string | null | undefined): string {
  if (!status) return 'لم يرد';
  return RSVP_STATUS_ARABIC[status] ?? 'لم يرد';
}

export interface ExportGuest {
  full_name: string;
  phone_e164: string | null;
  group_label: string | null;
  companions_allowed: number | null;
}

/**
 * Build a UTF-8 CSV (with BOM) for download.
 *
 * Columns: الاسم, الجوال, من طرف, المرافقون, حالة الرد
 */
export function buildExportCSV(
  guests: ExportGuest[],
  rsvpByGuestId: Record<string, string | null>,
  guestIds: string[],
): string {
  const BOM = '\uFEFF';
  const headers = ['الاسم', 'الجوال', 'من طرف', 'المرافقون', 'حالة الرد'];

  const dataRows = guests.map((g, i) => {
    const guestId = guestIds[i];
    const rsvpStatus = rsvpByGuestId[guestId] ?? null;
    const phoneWrap = g.phone_e164 ? `\u202A${g.phone_e164}\u202C` : '';
    return [
      g.full_name,
      phoneWrap,
      groupLabelLabel(g.group_label),
      String(g.companions_allowed ?? 0),
      rsvpStatusArabic(rsvpStatus),
    ];
  });

  const csv = Papa.unparse({
    fields: headers,
    data: dataRows,
  });

  return BOM + csv;
}

/**
 * Download sample CSV template with Arabic headers + BOM.
 */
export function downloadSampleCSV(): void {
  const BOM = '\uFEFF';
  const headers = ['الاسم', 'الجوال', 'من طرف', 'المرافقون'];

  // Headers-only template — zero data rows so users start with a clean slate
  const csv = Papa.unparse({
    fields: headers,
    data: [],
  });

  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'قالب_الضيوف.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Trigger a browser download of a string as a file.
 */
export function downloadStringAsFile(
  content: string,
  filename: string,
  mimeType = 'text/csv;charset=utf-8',
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
