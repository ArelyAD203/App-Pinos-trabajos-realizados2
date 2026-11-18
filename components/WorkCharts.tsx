import React, { useMemo, useState } from 'react';
import type { WorkEntry } from '../types';
import { categoryOf, countBy, monthCounts } from '../workFilters';

type View = 'person' | 'month' | 'category';
const views: { key: View; label: string }[] = [
  { key: 'person', label: 'Por persona' },
  { key: 'month', label: 'Por mes' },
  { key: 'category', label: 'Por categoría' },
];

export default function WorkCharts({ data }: { data: WorkEntry[] }) {
  const [view, setView] = useState<View>('person');
  const rows = useMemo(() => view === 'month' ? monthCounts(data) :
    countBy(data, view === 'person' ? entry => entry.persona : categoryOf)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es')), [data, view]);
  const categories = useMemo(() => countBy(data, categoryOf).sort((a, b) => b.count - a.count), [data]);
  const maximum = Math.max(1, ...rows.map(row => row.count));
  return (
    <section aria-label="Distribución de trabajos" className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold">Distribución de trabajos</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{data.length} registros según los filtros. Cada mes se muestra con su año.</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Agrupar gráfica">
          {views.map(option => <button key={option.key} aria-pressed={view === option.key} onClick={() => setView(option.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${view === option.key ? 'bg-[#9B5DE5] text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>{option.label}</button>)}
        </div>
      </div>
      {!rows.length ? <p role="status" className="py-8 text-center text-slate-500 dark:text-slate-400">No hay registros para graficar con estos filtros.</p> : (
        <ul aria-label={views.find(option => option.key === view)?.label} className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {rows.map(row => <li key={row.label}>
            <div className="flex justify-between gap-4 mb-1 text-sm"><span>{row.label}</span><span className="font-bold tabular-nums">{row.count} <span className="font-normal text-slate-500 dark:text-slate-400">({Math.round(row.count / data.length * 100)}%)</span></span></div>
            <div aria-hidden="true" className="h-5 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden"><div className="h-full bg-[#9B5DE5] rounded" style={{ width: `${row.count / maximum * 100}%` }} /></div>
          </li>)}
        </ul>
      )}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold mb-3">Total por categoría</h3>
        <dl className="flex flex-wrap gap-3">{categories.map(row => <div key={row.label} className="flex gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-sm"><dt>{row.label}</dt><dd className="font-bold">{row.count}</dd></div>)}</dl>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Los registros anteriores aparecen como “Sin categoría”. Puedes clasificarlos en la tabla.</p>
      </div>
    </section>
  );
}
