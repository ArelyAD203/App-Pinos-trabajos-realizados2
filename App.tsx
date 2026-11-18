import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { WorkEntry } from './types';
import { WORK_DATA, MONTHS_ORDER } from './constants';
import { CATEGORIES, categoryOf, filterEntries } from './workFilters';
import { useSavedView } from './useSavedView';
import WorkCharts from './components/WorkCharts';
import Header from './components/Header';
import StatCards from './components/StatCards';
import FilterPanel from './components/FilterPanel';
import DataTable from './components/DataTable';
import DataActions from './components/DataActions';
import AddEntryForm from './components/AddEntryForm';
import ConfirmationModal from './components/ConfirmationModal';
import { collection, onSnapshot, doc, writeBatch, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const REVIEW_MODE = import.meta.env.VITE_REVIEW_MODE === 'true';
const metadataRef = doc(db, 'appMetadata', 'workEntries');
interface UpdateInfo { updatedAt?: string; lastImportAt?: string; importFileName?: string; importCount?: number }
const dateString = (value: any): string | undefined => value?.toDate?.().toISOString() || (typeof value === 'string' ? value : undefined);
const readInfo = (data: any): UpdateInfo => ({ updatedAt: dateString(data?.updatedAt), lastImportAt: dateString(data?.lastImportAt), importFileName: data?.importFileName, importCount: data?.importCount });
const formatDate = (value?: string) => value && !Number.isNaN(Date.parse(value)) ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' }).format(new Date(value)) : 'Sin fecha registrada';

function App() {
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [info, setInfo] = useState<UpdateInfo>({});
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { const saved = localStorage.getItem('theme'); if (saved === 'light' || saved === 'dark') return saved; } catch { /* Use system preference. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [workData, setWorkData] = useState<WorkEntry[]>([]);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const { view, setFilters, setPage, setPageSize, reset } = useSavedView(REVIEW_MODE ? 'pinos-review-view-v3' : 'pinos-view-v3', isFirebaseLoading);
  const filters = view.filters;
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (REVIEW_MODE) {
      Promise.all([getDocs(collection(db, 'workEntries')), getDoc(metadataRef).catch(() => null), import('./previewCategories')]).then(([entries, metadata, { withReviewCategories }]) => {
        if (!active) return;
        setWorkData(withReviewCategories(entries.docs.map(item => ({ ...item.data(), id: item.id } as WorkEntry))));
        setInfo(readInfo(metadata?.data()));
      }).catch(() => {
        if (!active) return;
        setWorkData(WORK_DATA.map(entry => ({ ...entry, id: crypto.randomUUID() })));
        setNotice({ text: 'No se pudieron cargar los datos reales. Se muestran datos de respaldo para esta revisión.', error: true });
      }).finally(() => { if (active) setIsFirebaseLoading(false); });
      return () => { active = false; };
    }
    const unsubscribeEntries = onSnapshot(collection(db, 'workEntries'), snapshot => {
      setWorkData(snapshot.docs.map(item => ({ ...item.data(), id: item.id } as WorkEntry)));
      setLoadFailed(false); setIsFirebaseLoading(false);
    }, () => {
      setLoadFailed(true); setIsFirebaseLoading(false);
      setNotice({ text: 'No se pudieron cargar los registros. Revisa tu conexión y recarga la página.', error: true });
    });
    const unsubscribeMetadata = onSnapshot(metadataRef, snapshot => setInfo(readInfo(snapshot.data())), () => {
      setNotice({ text: 'Los registros están disponibles, pero no se pudo consultar la fecha de actualización.', error: true });
    });
    return () => { unsubscribeEntries(); unsubscribeMetadata(); };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('theme', theme); } catch { /* Theme remains usable. */ }
  }, [theme]);

  const filterOptions = useMemo(() => ({
    years: Array.from(new Set<number>(workData.map(entry => Number(entry.ano)))).sort((a, b) => b - a),
    months: MONTHS_ORDER,
    people: Array.from(new Set(workData.map(entry => entry.persona))).sort(),
    categories: Array.from(new Set([...CATEGORIES, ...workData.map(categoryOf)]))
  }), [workData]);
  const filteredData = useMemo(() => filterEntries(workData, filters), [workData, filters]);
  const hasActiveFilters = !!(filters.year.length || filters.month.length || filters.person.length || filters.category.length || filters.search.trim());
  const selectedPeople = filterOptions.people.filter(person => !filters.person.length || filters.person.includes(person));
  const activeMonths = new Set(workData.map(entry => `${entry.ano}-${entry.mes}`)).size;

  useEffect(() => {
    if (!notice || notice.error) return;
    const timer = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(timer);
  }, [notice]);

  const perform = async (action: () => Promise<void>, success: string) => {
    if (busyRef.current) throw new Error('Espera a que termine la operación actual.');
    busyRef.current = true; setBusy(true); setNotice(null);
    try { await action(); setNotice({ text: success + (REVIEW_MODE ? ' (Prueba: no se modificaron los datos reales.)' : ''), error: false }); }
    catch (error) { const code = (error as { code?: string })?.code; const text = code === 'permission-denied' ? 'No tienes permiso para guardar este cambio. Revisa el acceso a Firebase.' : code === 'unavailable' ? 'No hay conexión con Firebase. Tus datos de captura se conservan; vuelve a intentar.' : code ? 'No se pudo guardar el cambio. Revisa tu conexión e inténtalo de nuevo.' : error instanceof Error ? error.message : 'No se pudo guardar el cambio. Inténtalo de nuevo.'; setNotice({ text, error: true }); throw error; }
    finally { busyRef.current = false; setBusy(false); }
  };

  // A normal change and its timestamp are committed together.
  const persistChange = async (change: (batch: ReturnType<typeof writeBatch>) => void) => {
    const batch = writeBatch(db); change(batch);
    batch.set(metadataRef, { updatedAt: serverTimestamp() }, { merge: true });
    await batch.commit();
  };
  const markPreviewUpdate = (extra: Partial<UpdateInfo> = {}) => setInfo(prev => ({ ...prev, updatedAt: new Date().toISOString(), ...extra }));

  const handleCategoryChange = async (id: string, categoria: string) => {
    try { await perform(async () => {
      if (REVIEW_MODE) { setWorkData(prev => prev.map(entry => entry.id === id ? { ...entry, categoria } : entry)); markPreviewUpdate(); }
      else await persistChange(batch => batch.update(doc(db, 'workEntries', id), { categoria }));
    }, 'Categoría guardada.'); } catch { /* Notice reports failure; current category is retained. */ }
  };
  const handleAddEntry = async (entry: Omit<WorkEntry, 'id' | 'ano'> & { ano: number | string }) => perform(async () => {
    const data = { ...entry, ano: Number(entry.ano), mes: entry.mes.trim(), trabajo: entry.trabajo.trim() };
    if (REVIEW_MODE) { setWorkData(prev => [...prev, { ...data, id: crypto.randomUUID() }]); markPreviewUpdate(); }
    else await persistChange(batch => batch.set(doc(collection(db, 'workEntries')), data));
  }, 'Registro guardado.');
  const handleConfirmDelete = async () => {
    if (!recordIdToDelete) return;
    try { await perform(async () => {
      if (REVIEW_MODE) { setWorkData(prev => prev.filter(entry => entry.id !== recordIdToDelete)); markPreviewUpdate(); }
      else await persistChange(batch => batch.delete(doc(db, 'workEntries', recordIdToDelete)));
      setRecordIdToDelete(null);
    }, 'Registro eliminado.'); } catch { /* Keep confirmation open for retry. */ }
  };

  const replaceEntries = async (entries: WorkEntry[], fileName?: string) => {
    if (REVIEW_MODE) {
      setWorkData(entries);
      markPreviewUpdate(fileName ? { lastImportAt: new Date().toISOString(), importFileName: fileName, importCount: entries.length } : {});
      return;
    }
    const existing = await getDocs(collection(db, 'workEntries'));
    // Reuse existing document IDs so ordinary replacements fit in one atomic batch.
    const count = Math.max(existing.size, entries.length);
    if (count > 499) throw new Error('El reemplazo admite hasta 499 registros por operación. No se modificaron los datos.');
    const batch = writeBatch(db);
    for (let index = 0; index < count; index++) {
      const ref = existing.docs[index]?.ref || doc(collection(db, 'workEntries'));
      if (entries[index]) { const { id, ...data } = entries[index]; batch.set(ref, data); }
      else batch.delete(ref);
    }
    batch.set(metadataRef, { updatedAt: serverTimestamp(), ...(fileName ? { lastImportAt: serverTimestamp(), importFileName: fileName, importCount: entries.length } : {}) }, { merge: true });
    await batch.commit();
  };
  const handleImportData = (entries: WorkEntry[], fileName: string) => perform(() => replaceEntries(entries, fileName), `Archivo importado: ${entries.length} registros.`);
  const handleClearDatabase = async () => {
    if (!window.confirm('¿Quieres eliminar todos los registros? No necesitas hacerlo antes de importar un Excel.')) return;
    await perform(() => replaceEntries([]), 'Base de datos vaciada.');
  };

  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 flex flex-col">
      {notice && <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-lg z-50 p-4 rounded-xl shadow-lg border ${notice.error ? 'bg-red-50 border-red-300 text-red-900' : 'bg-green-50 border-green-300 text-green-900'}`} role={notice.error ? 'alert' : 'status'}>
        <div className="flex gap-4 justify-between"><p>{notice.text}</p><button type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)} className="px-2 font-bold">×</button></div>
      </div>}
      <div className="container mx-auto p-4 sm:p-6 md:p-8 flex-1">
        {REVIEW_MODE && <div className="mb-4 rounded-xl bg-purple-100 dark:bg-purple-900 p-4 text-sm" role="status">Vista previa: las pruebas de datos se reinician al recargar y no modifican Firebase. Los filtros y la posición sí se recuerdan en este navegador.</div>}
        <Header theme={theme} setTheme={setTheme} />
        <div className="mt-4 flex flex-wrap justify-between items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div><p>Última modificación: <strong>{formatDate(info.updatedAt)}</strong></p></div>
          <button type="button" onClick={reset} className="text-purple-700 dark:text-purple-300 underline">Restablecer vista</button>
        </div>
        {isFirebaseLoading ? <p role="status" className="py-12 text-center">Cargando registros…</p> : loadFailed ? <p className="py-12 text-center">No hay conexión con los registros. <button onClick={() => window.location.reload()} className="underline">Volver a intentar</button></p> : (
          <main className="mt-8 flex flex-col gap-8 flex-1">
            <StatCards totalEntries={workData.length} uniquePeople={filterOptions.people.length} activeMonths={activeMonths} />
            <FilterPanel filters={filters} setFilters={setFilters} options={filterOptions} resultCount={filteredData.length}
              personCounts={selectedPeople.map(person => ({ person, count: filteredData.filter(entry => entry.persona === person).length }))} />
            <WorkCharts data={filteredData} />
            <DataTable categories={filterOptions.categories} onCategoryChange={handleCategoryChange} people={selectedPeople} data={filteredData} hasActiveFilters={hasActiveFilters} onDeleteEntry={setRecordIdToDelete}
              busy={busy} page={view.page} pageSize={view.pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} />
            <AddEntryForm peopleOptions={filterOptions.people} monthOptions={MONTHS_ORDER} onAddEntry={handleAddEntry} busy={busy} />
            <div className="pb-8">
              <DataActions fullData={workData} onImport={handleImportData} onClearData={handleClearDatabase} busy={busy} />
            </div>
          </main>
        )}
      </div>
      <ConfirmationModal isOpen={!!recordIdToDelete} onClose={() => setRecordIdToDelete(null)} onConfirm={handleConfirmDelete} busy={busy} title="Confirmar eliminación" message="¿Quieres eliminar este registro? Esta acción no se puede deshacer." />
    </div>
  );
}
export default App;
