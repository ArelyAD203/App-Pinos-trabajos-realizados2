import React, { useRef, useState } from 'react';
import { categoryOf, countBy } from '../workFilters';
import { parseImport } from '../importEntries';
import type { WorkEntry } from '../types';
import { MONTHS_ORDER } from '../constants';
declare global { interface Window { XLSX: any } }
interface Props { fullData: WorkEntry[]; onImport: (entries: WorkEntry[], fileName: string) => Promise<void>; onClearData: () => Promise<void>; busy: boolean }
const buttonClass = 'rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500';
export default function DataActions({ fullData, onImport, onClearData, busy }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<{ name: string; entries: WorkEntry[] } | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reading, setReading] = useState(false);
  const disabled = busy || reading;
  const handleExport = () => {
    setError(''); setMessage('');
    try {
      if (!window.XLSX) throw new Error('No se pudo cargar la herramienta de Excel. Revisa tu conexión y recarga la página.');
      const sorted = [...fullData].sort((a, b) => Number(a.ano) - Number(b.ano) || MONTHS_ORDER.indexOf(a.mes) - MONTHS_ORDER.indexOf(b.mes));
      const rows = sorted.map(entry => ({ 'Mes': entry.mes, 'Año': entry.ano, 'Persona': entry.persona, 'Trabajo Realizado': entry.trabajo, 'Categoría': categoryOf(entry) }));
      const workbook = window.XLSX.utils.book_new();
      const sheet = rows.length ? window.XLSX.utils.json_to_sheet(rows) : window.XLSX.utils.aoa_to_sheet([['Mes', 'Año', 'Persona', 'Trabajo Realizado', 'Categoría']]);
      window.XLSX.utils.book_append_sheet(workbook, sheet, 'Trabajos');
      window.XLSX.writeFile(workbook, 'Reporte_Trabajos_Realizados.xlsx');
      setMessage(`Excel generado: ${fullData.length} registros.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo generar el archivo.'); }
  };
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setError(''); setMessage(''); setPending(null); setReading(true);
    try {
      if (!window.XLSX) throw new Error('No se pudo cargar la herramienta de Excel. Revisa tu conexión y recarga la página.');
      const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array' });
      if (!workbook.SheetNames.length) throw new Error('El archivo no tiene hojas.');
      const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      setPending({ name: file.name, entries: parseImport(rows) });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo leer el Excel. No se modificaron los datos.'); }
    finally { setReading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };
  const confirmImport = async () => {
    if (!pending) return;
    setError(''); setMessage('');
    try {
      await onImport(pending.entries, pending.name);
      setMessage(`Archivo importado: ${pending.entries.length} registros.`);
      setPending(null);
    } catch { setError('No se completó la importación. Revisa el aviso y vuelve a intentar; el archivo sigue preparado.'); }
  };
  return <section className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
    <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Utilidades</h2>
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled={disabled} onClick={() => fileInputRef.current?.click()} className={`${buttonClass} bg-slate-100 dark:bg-slate-700 min-w-12`}>{reading ? '…' : 'A'}</button>
      <button type="button" disabled={disabled} onClick={handleExport} className={`${buttonClass} bg-slate-100 dark:bg-slate-700 min-w-12`}>B</button>
      <button type="button" disabled={disabled} onClick={() => { setError(''); setMessage(''); void onClearData().catch(() => setError('No se pudo vaciar la base de datos. Revisa el aviso.')); }} className={`${buttonClass} bg-slate-100 dark:bg-slate-700 min-w-12`}>C</button>
    </div>
    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" aria-label="Seleccionar archivo" onChange={handleFileChange} className="hidden" disabled={disabled} />
    {error && <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-300">{error}</p>}
    {message && <p role="status" className="mt-4 text-sm text-green-700 dark:text-green-300">{message}</p>}
    {pending && <section aria-label="Revisar importación" className="mt-5 p-4 rounded-xl border border-purple-300 dark:border-purple-600 space-y-3">
      <h3 className="font-bold">Revisar antes de reemplazar</h3>
      <p className="text-sm break-all">Archivo: {pending.name}</p>
      <p className="text-sm"><strong>{pending.entries.length} registros válidos</strong> reemplazarán los {fullData.length} registros actuales.</p>
      <dl className="flex flex-wrap gap-2 text-sm">{countBy(pending.entries, categoryOf).map(row => <div key={row.label} className="flex gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700"><dt>{row.label}:</dt><dd className="font-bold">{row.count}</dd></div>)}</dl>
      <p className="text-sm text-slate-600 dark:text-slate-300">Se usa la primera hoja del archivo. Si encuentras un error, cancela y corrige el Excel antes de cargarlo.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={disabled} onClick={() => setPending(null)} className={`${buttonClass} bg-slate-100 dark:bg-slate-700`}>Cancelar importación</button>
        <button type="button" disabled={disabled} onClick={() => void confirmImport()} className={`${buttonClass} bg-[#9B5DE5] text-white`}>{busy ? 'Importando…' : 'Reemplazar datos'}</button>
      </div>
    </section>}
  </section>;
}
