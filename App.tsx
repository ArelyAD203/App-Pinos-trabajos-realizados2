import React, { useState, useMemo, useEffect } from 'react';
import type { WorkEntry, Filters } from './types';
import { WORK_DATA, MONTHS_ORDER, DATA_VERSION } from './constants';
import Header from './components/Header';
import StatCards from './components/StatCards';
import FilterPanel from './components/FilterPanel';
import DataTable from './components/DataTable';
import DataActions from './components/DataActions';
import AddEntryForm from './components/AddEntryForm';
import ConfirmationModal from './components/ConfirmationModal';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  
  const [workData, setWorkData] = useState<WorkEntry[]>(() => {
    try {
      const savedVersion = window.localStorage.getItem('dataVersion');
      const savedData = window.localStorage.getItem('workData');

      if (savedVersion === DATA_VERSION && savedData) {
        return JSON.parse(savedData);
      }

      const initialData = WORK_DATA.map((entry) => ({
        ...entry,
        id: crypto.randomUUID(),
      }));
      
      window.localStorage.setItem('workData', JSON.stringify(initialData));
      window.localStorage.setItem('dataVersion', DATA_VERSION);
      return initialData;
      
    } catch (error) {
      console.error("Error initializing data state:", error);
      const fallbackData = WORK_DATA.map((entry) => ({
        ...entry,
        id: crypto.randomUUID(),
      }));
      return fallbackData;
    }
  });

  const [filters, setFilters] = useState<Filters>({
    year: 'all',
    month: 'all',
    person: 'all',
  });
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem('workData', JSON.stringify(workData));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [workData]);

  const filterOptions = useMemo(() => {
    const years = [...new Set(workData.map(item => item.ano))].sort((a, b) => b - a);
    const people = [...new Set(workData.map(item => item.persona))].sort();
    return { years, months: MONTHS_ORDER, people };
  }, [workData]);
  
  const activeYearMonthsCount = useMemo(() => {
    const uniqueYearMonths = new Set(workData.map(item => `${item.ano}-${item.mes}`));
    return uniqueYearMonths.size;
  }, [workData]);

  const hasActiveFilters = useMemo(() => {
    return filters.year !== 'all' || filters.month !== 'all' || filters.person !== 'all';
  }, [filters]);

  const filteredData = useMemo(() => {
    if (!hasActiveFilters) return [];

    return workData.filter((item) => {
      const yearMatch =
        filters.year === "all" || item.ano === parseInt(filters.year, 10);
      const monthMatch = filters.month === "all" || item.mes === filters.month;
      const personMatch =
        filters.person === "all" || item.persona === filters.person;
      return yearMatch && monthMatch && personMatch;
    });
  }, [filters, workData, hasActiveFilters]);
  
  const handleAddEntry = (newEntry: Omit<WorkEntry, 'id' | 'ano'> & { ano: number | string }) => {
     const entryToAdd: WorkEntry = {
      ...newEntry,
      ano: typeof newEntry.ano === 'string' ? parseInt(newEntry.ano, 10) : newEntry.ano,
      id: crypto.randomUUID(),
    };
    setWorkData(prevData => [...prevData, entryToAdd]);
  };

  const handleDeleteEntry = (id: string) => {
    setRecordIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!recordIdToDelete) return;
    setWorkData(currentData => {
      const indexToDelete = currentData.findIndex(entry => entry.id === recordIdToDelete);
      if (indexToDelete === -1) {
        return currentData;
      }
      return [
        ...currentData.slice(0, indexToDelete),
        ...currentData.slice(indexToDelete + 1),
      ];
    });
    setIsConfirmModalOpen(false);
    setRecordIdToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setRecordIdToDelete(null);
  };

  const handleImportData = (importedData: any[]) => {
    const parsedData: WorkEntry[] = importedData
      .map((rawRow): WorkEntry | null => {
        const row: { [key:string]: any } = {};
        Object.keys(rawRow).forEach(key => {
          row[key.toLowerCase().trim()] = rawRow[key];
        });

        const anoKeys = ['año', 'ano'];
        const mesKeys = ['mes'];
        const personaKeys = ['persona'];
        const trabajoKeys = ['trabajo realizado', 'trabajo'];

        const findValue = (keys: string[]) => {
          for (const key of keys) {
            if (row[key] !== undefined && row[key] !== null) {
              return row[key];
            }
          }
          return '';
        };

        const anoStr = String(findValue(anoKeys));
        const personaStr = String(findValue(personaKeys)).trim();
        const mesStr = String(findValue(mesKeys));
        const trabajoStr = String(findValue(trabajoKeys));

        if (!personaStr || !trabajoStr || !mesStr || !anoStr) {
          return null;
        }

        const anoNum = parseInt(anoStr, 10);
        if (isNaN(anoNum)) {
            return null;
        }

        return {
          id: crypto.randomUUID(),
          mes: mesStr,
          ano: anoNum,
          persona: personaStr,
          trabajo: trabajoStr,
        };
      })
      .filter((entry): entry is WorkEntry => entry !== null);

    if (parsedData.length === 0 && importedData.length > 0) {
      alert("Error: No se pudieron importar los datos. Verifique que el archivo Excel tenga columnas con los encabezados: 'Año' (o 'Ano'), 'Mes', 'Persona' y 'Trabajo Realizado'.");
      return;
    }
    
    if (parsedData.length > 0) {
      setWorkData(parsedData);
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  return (
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <Header theme={theme} setTheme={setTheme} />
        <main className="mt-8 flex flex-col gap-8">
          <StatCards 
            totalEntries={workData.length}
            uniquePeople={filterOptions.people.length}
            activeMonths={activeYearMonthsCount}
          />
          <FilterPanel 
            filters={filters}
            setFilters={setFilters}
            options={filterOptions}
          />
          <DataTable data={filteredData} hasActiveFilters={hasActiveFilters} onDeleteEntry={handleDeleteEntry} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DataActions
              fullData={workData}
              onImport={handleImportData}
            />
            <AddEntryForm 
              peopleOptions={filterOptions.people}
              monthOptions={MONTHS_ORDER}
              onAddEntry={handleAddEntry}
            />
          </div>
        </main>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
        message="¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer y los datos se perderán permanentemente."
      />
    </div>
  );
}

export default App;