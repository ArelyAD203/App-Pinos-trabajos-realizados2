import React, { useEffect, useState } from 'react';
import { categoryOf } from '../workFilters';
import type { WorkEntry } from '../types';
interface DataTableProps {
  data: WorkEntry[]; categories: string[]; people: string[]; hasActiveFilters: boolean;
  onCategoryChange: (id: string, category: string) => Promise<void>;
  onDeleteEntry: (id: string) => void; busy: boolean;
  page: number; pageSize: number; onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void;
}
const buttonClass = 'px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500';
export default function DataTable({ data, categories, onCategoryChange, people, hasActiveFilters, onDeleteEntry, busy, page, pageSize, onPageChange, onPageSizeChange }: DataTableProps) {
  const [localBusy, setLocalBusy] = useState<string | null>(null);
  const pageCount = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const visible = data.slice(start, start + pageSize);
  useEffect(() => { if (page > pageCount) onPageChange(pageCount); }, [page, pageCount, onPageChange]);
  const changeCategory = async (entry: WorkEntry, category: string) => {
    setLocalBusy(entry.id);
    try { await onCategoryChange(entry.id, category); } finally { setLocalBusy(null); }
  };
  const categorySelect = (entry: WorkEntry, prefix: string) => <div>
    <label htmlFor={`${prefix}-${entry.id}`} className="sr-only">Categoría de {entry.trabajo}</label>
    <select id={`${prefix}-${entry.id}`} value={categoryOf(entry)} disabled={busy || localBusy === entry.id}
      onChange={event => void changeCategory(entry, event.target.value)} className="w-full min-w-40 p-2 rounded-lg border border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 disabled:opacity-50">
      {categories.map(category => <option key={category}>{category}</option>)}
    </select>
  </div>;
  const deleteButton = (entry: WorkEntry) => <button type="button" disabled={busy} onClick={() => onDeleteEntry(entry.id)} aria-label={`Eliminar registro: ${entry.trabajo}`} className="text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-500">Eliminar</button>;
  const navigate = (next: number) => {
    onPageChange(next);
    document.getElementById('registros')?.scrollIntoView({ block: 'start' });
  };
  return (
    <section id="registros" tabIndex={-1} aria-labelledby="records-title" className="scroll-mt-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="p-5 flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-700">
        <div><h2 id="records-title" className="text-xl font-bold">Registros</h2><p className="text-sm text-slate-500 dark:text-slate-400" role="status">{data.length ? `Mostrando ${start + 1}–${Math.min(start + pageSize, data.length)} de ${data.length} registros` : '0 registros'}</p></div>
        <label className="text-sm flex items-center gap-2">Registros por página
          <select aria-label="Registros por página" value={pageSize} onChange={event => onPageSizeChange(Number(event.target.value))} className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
            {[25, 50, 100].map(size => <option key={size}>{size}</option>)}
          </select>
        </label>
      </div>
      {!data.length ? <div className="p-10 text-center"><h3 className="font-bold text-lg">{hasActiveFilters ? 'No se encontraron resultados' : 'No hay registros disponibles'}</h3><p className="mt-2 text-slate-500 dark:text-slate-400">{hasActiveFilters ? 'Quita algún filtro o cambia la búsqueda.' : 'Importa un Excel o añade un registro para comenzar.'}</p></div> : <>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left"><thead className="text-white bg-blue-900 dark:bg-blue-950"><tr>{['Mes', 'Año', 'Persona', 'Trabajo realizado', 'Categoría', 'Acciones'].map(label => <th key={label} scope="col" className="px-4 py-4 font-semibold">{label}</th>)}</tr></thead>
            <tbody>{visible.map(entry => <tr key={entry.id} className="border-b border-slate-200 dark:border-slate-700 even:bg-slate-50 dark:even:bg-slate-700/30">
              <td className="px-4 py-4 whitespace-nowrap">{entry.mes}</td><td className="px-4 py-4">{entry.ano}</td><td className="px-4 py-4">{entry.persona}</td>
              <td className="px-4 py-4 min-w-60 break-words">{entry.trabajo}</td><td className="px-4 py-4">{categorySelect(entry, 'table-category')}</td><td className="px-4 py-4">{deleteButton(entry)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <ul aria-label="Tarjetas de registros" className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
          {visible.map(entry => <li key={entry.id} className="p-5 space-y-3">
            <div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{entry.persona}</h3><span className="text-sm text-slate-500 dark:text-slate-400">{entry.mes} {entry.ano}</span></div>
            <p className="whitespace-pre-wrap break-words">{entry.trabajo}</p>
            <label htmlFor={`card-category-${entry.id}`} className="block text-sm font-semibold">Categoría</label>
            {categorySelect(entry, 'card-category')}<div className="text-right">{deleteButton(entry)}</div>
          </li>)}
        </ul>
      </>}
      <nav aria-label="Paginación de registros" className="p-5 border-t border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
        <p className="text-sm">Página {currentPage} de {pageCount}</p><div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass} disabled={currentPage === 1} onClick={() => navigate(1)}>Primera</button>
          <button type="button" className={buttonClass} disabled={currentPage === 1} onClick={() => navigate(currentPage - 1)}>Anterior</button>
          <button type="button" className={buttonClass} disabled={currentPage === pageCount} onClick={() => navigate(currentPage + 1)}>Siguiente</button>
          <button type="button" className={buttonClass} disabled={currentPage === pageCount} onClick={() => navigate(pageCount)}>Última</button>
        </div>
      </nav>
      <div className="p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Totales de todos los registros filtrados, incluyendo las demás páginas.</p>
        <dl aria-label="Totales de los registros filtrados" className="flex flex-wrap gap-x-8 gap-y-3">
          {people.map(person => <div key={person} className="flex gap-2"><dt>{person}:</dt><dd className="font-bold">{data.filter(entry => entry.persona === person).length}</dd></div>)}
          <div className="flex gap-2 font-bold"><dt>Total general:</dt><dd>{data.length} registros</dd></div>
        </dl>
      </div>
    </section>
  );
}
