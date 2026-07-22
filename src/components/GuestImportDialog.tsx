import { useCallback, useRef, useState } from 'react';
import { Loader2, Upload, Download, FileSpreadsheet, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  parseCSV,
  parseExcel,
  parseVCard,
  markDuplicatesAgainstExisting,
  downloadSampleCSV,
  type ImportRow,
  type ImportRowStatus,
} from '@/lib/guestIO';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { groupLabelLabel } from '@/lib/groupLabels';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GuestImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  /** Existing phones in this event (E.164) — used for cross-event dedupe */
  existingPhones: Set<string>;
  /** Called after a successful import to refresh both guest list + RSVP stats */
  onImported: () => void;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  ImportRowStatus,
  { label: string; className: string }
> = {
  valid: {
    label: 'صالح',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  error_name: {
    label: 'خطأ: الاسم مفقود',
    className: 'bg-maroon-500/10 text-maroon-800 border-maroon-500/25',
  },
  error_phone: {
    label: 'خطأ: رقم غير صالح',
    className: 'bg-maroon-500/10 text-maroon-800 border-maroon-500/25',
  },
  incomplete_phone: {
    label: 'رقم غير مكتمل — أضف رمز الدولة',
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  },
  duplicate: {
    label: 'مكرر',
    className: 'bg-amber-50 text-amber-900 border-amber-200',
  },
};

function isRowImportable(status: ImportRowStatus): boolean {
  return status === 'valid';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GuestImportDialog({
  open,
  onOpenChange,
  eventId,
  existingPhones,
  onImported,
}: GuestImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<ImportRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // ---- Stats ----
  const validCount = rows.filter((r) => r.status === 'valid').length;
  const errorCount = rows.filter(
    (r) =>
      r.status === 'error_name' ||
      r.status === 'error_phone' ||
      r.status === 'incomplete_phone',
  ).length;
  const dupCount = rows.filter((r) => r.status === 'duplicate').length;
  const selectedCount = rows.filter((r) => r.selected && isRowImportable(r.status)).length;

  // ---- Reset ----
  const reset = useCallback(() => {
    setRows([]);
    setParsing(false);
    setParseError(null);
    setImporting(false);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  // ---- File selection ----
  const handleFile = useCallback(
    async (file: File) => {
      setParseError(null);
      setParsing(true);
      setFileName(file.name);

      // Detect by extension
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

      // Reject unsupported types immediately without trying to parse
      if (!['csv', 'xlsx', 'xls', 'vcf'].includes(ext)) {
        toast.error('نوع ملف غير مدعوم — استخدم CSV أو Excel أو vCard (.vcf)');
        setFileName(null);
        if (fileRef.current) fileRef.current.value = '';
        setParsing(false);
        return;
      }

      try {
        let parsed: ImportRow[];

        if (ext === 'csv') {
          const text = await file.text();
          parsed = parseCSV(text);
        } else if (ext === 'vcf') {
          const text = await file.text();
          parsed = parseVCard(text);
        } else {
          // .xlsx / .xls
          const buffer = await file.arrayBuffer();
          parsed = parseExcel(buffer);
        }

        if (parsed.length === 0) {
          setParseError('الملف فارغ أو لا يحتوي على بيانات صالحة');
          setRows([]);
          setParsing(false);
          return;
        }

        // Cross-event dedupe
        markDuplicatesAgainstExisting(parsed, existingPhones);
        setRows(parsed);
      } catch (err) {
        console.error('Import parse error:', err);
        setParseError('تعذّر قراءة الملف — تأكد أنه بصيغة CSV أو Excel أو vCard صالحة');
        setRows([]);
      } finally {
        setParsing(false);
      }
    },
    [existingPhones],
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  // ---- Toggle row selection ----
  const toggleRow = useCallback((index: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.index === index && isRowImportable(r.status)
          ? { ...r, selected: !r.selected }
          : r,
      ),
    );
  }, []);

  // ---- Toggle all valid ----
  const toggleAll = useCallback(() => {
    const allSelected = rows
      .filter((r) => isRowImportable(r.status))
      .every((r) => r.selected);

    setRows((prev) =>
      prev.map((r) =>
        isRowImportable(r.status) ? { ...r, selected: !allSelected } : r,
      ),
    );
  }, [rows]);

  // ---- Import ----
  const handleImport = useCallback(async () => {
    const toInsert = rows.filter((r) => r.selected && isRowImportable(r.status));
    if (toInsert.length === 0) {
      toast.error('لا يوجد صفوف صالحة محددة للاستيراد');
      return;
    }

    setImporting(true);

    try {
      const insertPayload = toInsert.map((r) => ({
        event_id: eventId,
        full_name: r.name,
        phone_e164: r.phoneNormalized || null,
        group_label: r.side,
        companions_allowed: r.companions,
        unique_token: crypto.randomUUID(),
      }));

      const { error } = await supabase.from('guests').insert(insertPayload);

      if (error) {
        toast.error(error.message || 'فشل استيراد الضيوف');
        return;
      }

      const skipped = rows.length - toInsert.length;
      toast.success(`تم استيراد ${toInsert.length} ضيف` + (skipped > 0 ? ` · تم تخطّي ${skipped}` : ''));
      reset();
      onOpenChange(false);
      onImported();
    } catch (err) {
      console.error('Import error:', err);
      toast.error('حدث خطأ أثناء الاستيراد');
    } finally {
      setImporting(false);
    }
  }, [rows, eventId, reset, onOpenChange, onImported]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !importing) {
          reset();
          onOpenChange(false);
        }
      }}
    >
      <DialogContent
        className="rounded-3xl border-gold-200 sm:max-w-2xl max-h-[90vh] flex flex-col"
        dir="rtl"
      >
        <DialogHeader className="sm:text-right">
          <DialogTitle className="font-black text-ink inline-flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-gold-700" />
            استيراد ضيوف من ملف
          </DialogTitle>
          <DialogDescription className="text-ink/55 leading-7">
            ارفع ملف CSV أو Excel أو vCard (.vcf) — سيتم عرض البيانات للمراجعة قبل الحفظ.
          </DialogDescription>
        </DialogHeader>

        {/* File input */}
        <div className="space-y-4 flex-1 min-h-0">
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-gold-300 bg-cream/60 px-5 py-2.5 text-sm font-bold text-ink/70 hover:border-gold-500 hover:bg-cream cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-gold-700" />
              {fileName ? fileName : 'اختر ملف CSV أو Excel أو vCard'}
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls,.vcf"
                className="sr-only"
                onChange={onFileChange}
                disabled={importing}
              />
            </label>
            <button
              type="button"
              onClick={downloadSampleCSV}
              className="inline-flex items-center gap-2 rounded-full border border-gold-200 bg-white px-4 py-2.5 text-sm font-bold text-ink/60 hover:border-gold-400 hover:text-ink/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              تحميل قالب
            </button>
          </div>

          {/* Parsing spinner */}
          {parsing && (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gold-600" />
              <span className="text-sm font-bold text-ink/55">جاري قراءة الملف…</span>
            </div>
          )}

          {/* Parse error */}
          {parseError && (
            <div className="flex items-center gap-3 rounded-2xl border border-maroon-500/25 bg-maroon-500/5 px-4 py-3">
              <AlertCircle className="w-5 h-5 text-maroon-600 shrink-0" />
              <p className="text-sm font-bold text-maroon-800">{parseError}</p>
            </div>
          )}

          {/* Preview table */}
          {rows.length > 0 && (
            <>
              {/* Stats header */}
              <div className="flex flex-wrap items-center gap-3 text-sm font-black">
                <span className="text-emerald-700">صالح {validCount}</span>
                <span className="text-ink/20">·</span>
                <span className="text-maroon-700">أخطاء {errorCount}</span>
                <span className="text-ink/20">·</span>
                <span className="text-amber-800">مكرر {dupCount}</span>
              </div>

              <ScrollArea className="max-h-[340px] overflow-auto rounded-2xl border border-gold-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold-200/80 bg-cream/50 text-ink/55 sticky top-0 z-10">
                      <th className="px-3 py-2.5 text-right">
                        <input
                          type="checkbox"
                          checked={
                            rows.filter((r) => isRowImportable(r.status)).length > 0 &&
                            rows
                              .filter((r) => isRowImportable(r.status))
                              .every((r) => r.selected)
                          }
                          onChange={toggleAll}
                          className="w-4 h-4 rounded border-gold-300 accent-gold-600"
                        />
                      </th>
                      <th className="text-right font-black px-3 py-2.5 whitespace-nowrap">
                        الاسم
                      </th>
                      <th className="text-right font-black px-3 py-2.5 whitespace-nowrap">
                        الجوال
                      </th>
                      <th className="text-right font-black px-3 py-2.5 whitespace-nowrap">
                        من طرف
                      </th>
                      <th className="text-right font-black px-3 py-2.5 whitespace-nowrap">
                        المرافقون
                      </th>
                      <th className="text-right font-black px-3 py-2.5 whitespace-nowrap">
                        الحالة
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const cfg = STATUS_CONFIG[row.status];
                      const importable = isRowImportable(row.status);
                      return (
                        <tr
                          key={row.index}
                          className={`border-b border-gold-100 last:border-0 ${
                            !importable ? 'opacity-60 bg-cream/30' : 'hover:bg-gold-50/40'
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              disabled={!importable}
                              onChange={() => toggleRow(row.index)}
                              className="w-4 h-4 rounded border-gold-300 accent-gold-600 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="px-3 py-2.5 font-bold text-ink whitespace-nowrap">
                            {row.name || (
                              <span className="text-maroon-600 italic">فارغ</span>
                            )}
                          </td>
                          <td
                            className="px-3 py-2.5 font-mono text-xs text-ink/65 whitespace-nowrap"
                          >
                            <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>
                              {row.phoneNormalized || row.phoneRaw || '—'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-ink/70 whitespace-nowrap">
                            {groupLabelLabel(row.side)}
                          </td>
                          <td className="px-3 py-2.5 tabular-nums text-ink/70">
                            {row.companions}
                          </td>
                          <td className="px-3 py-2.5">
                            {row.status === 'valid' ? (
                              <span className="text-emerald-600">
                                <Check className="w-4 h-4" />
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-black rounded-full px-2 py-0.5 border whitespace-nowrap ${cfg.className}`}
                                title={row.errorDetail}
                              >
                                {cfg.label}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="sm:flex-row-reverse gap-2 pt-2">
          {rows.length > 0 && (
            <button
              type="button"
              disabled={importing || selectedCount === 0}
              onClick={() => void handleImport()}
              className="btn-gold inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              استيراد {selectedCount} ضيف
            </button>
          )}
          <button
            type="button"
            disabled={importing}
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            className="rounded-full border border-gold-200 px-5 py-2.5 text-sm font-bold text-ink/70"
          >
            إلغاء
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
