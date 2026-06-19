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
import { collection, onSnapshot, addDoc, deleteDoc, doc, writeBatch, getDocs } from 'firebase/firestore';
import { db } from './firebase';

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
      const savedData = window.localStorage.getItem('workData');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch {
      // ignore
    }
    return WORK_DATA.map((entry) => ({ ...entry, id: crypto.randomUUID() }));
  });
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(true);

  // Sync with Firebase
  useEffect(() => {
    let unsubscribe: () => void;

    const initFirebase = async () => {
      try {
        const entriesRef = collection(db, 'workEntries');
        const snap = await getDocs(entriesRef);
        
        // Seed initial data if Firebase is empty
        if (snap.empty) {
          console.log('Seeding initial data to Firebase...');
          let dataToSeed = [...WORK_DATA];

          // Check if local storage has more data (from previous local app version)
          try {
            const savedData = window.localStorage.getItem('workData');
            if (savedData) {
              const parsedLocalData = JSON.parse(savedData) as WorkEntry[];
              if (parsedLocalData.length > dataToSeed.length) {
                dataToSeed = parsedLocalData;
                console.log(`Found ${dataToSeed.length} records in local storage, migrating those to Firebase.`);
              }
            }
          } catch(e) {
            console.error("Could not read local data for migration", e);
          }

          let batch = writeBatch(db);
          let count = 0;
          
          for (const entry of dataToSeed) {
            const docRef = doc(collection(db, 'workEntries'));
            const { id, ...dataToSave } = entry; // Strip local fake IDs
            batch.set(docRef, { ...dataToSave, ano: typeof dataToSave.ano === 'string' ? parseInt(dataToSave.ano, 10) : dataToSave.ano });
            count++;

            if (count === 400) {
              await batch.commit();
              batch = writeBatch(db);
              count = 0;
            }
          }
          
          if (count > 0) {
            await batch.commit();
          }
        }
      } catch (err) {
        console.error("Error seeding data", err);
      }

      unsubscribe = onSnapshot(collection(db, 'workEntries'), (snapshot) => {
        const entries: WorkEntry[] = [];
        snapshot.forEach((docSnap) => {
          entries.push({ id: docSnap.id, ...docSnap.data() } as WorkEntry);
        });
        setWorkData(entries);
        setIsFirebaseLoading(false);
      }, (error) => {
        console.error("Error fetching data from Firebase:", error);
        setIsFirebaseLoading(false);
      });
    };

    initFirebase();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const [filters, setFilters] = useState<Filters>({
    year: 'all',
    month: 'all',
    person: 'all',
  });
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);

  const filterOptions = useMemo(() => {
    const dataYears = workData.map(item => item.ano);
    const allYears = Array.from(new Set(dataYears)).sort((a, b) => b - a);
    
    const people = [...new Set(workData.map(item => item.persona))].sort();
    return { years: allYears, months: MONTHS_ORDER, people };
  }, [workData]);
  
  const activeYearMonthsCount = useMemo(() => {
    const uniqueYearMonths = new Set(workData.map(item => `${item.ano}-${item.mes}`));
    return uniqueYearMonths.size;
  }, [workData]);

  const hasActiveFilters = useMemo(() => {
    return filters.year !== 'all' || filters.month !== 'all' || filters.person !== 'all';
  }, [filters]);

  const filteredData = useMemo(() => {
    return workData.filter((item) => {
      const yearMatch =
        filters.year === "all" || String(item.ano) === String(filters.year);
      const monthMatch = filters.month === "all" || item.mes === filters.month;
      const personMatch =
        filters.person === "all" || item.persona === filters.person;
      return yearMatch && monthMatch && personMatch;
    });
  }, [filters, workData]);
  
  const handleAddEntry = async (newEntry: Omit<WorkEntry, 'id' | 'ano'> & { ano: number | string }) => {
     const entryData = {
      ...newEntry,
      ano: typeof newEntry.ano === 'string' ? parseInt(newEntry.ano, 10) : newEntry.ano,
    };
    try {
      await addDoc(collection(db, 'workEntries'), entryData);
    } catch (err) {
      console.error("Error adding entry", err);
    }
  };

  const handleDeleteEntry = (id: string) => {
    setRecordIdToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recordIdToDelete) return;
    try {
      await deleteDoc(doc(db, 'workEntries', recordIdToDelete));
    } catch (error) {
      console.error("Error deleting entry", error);
    }
    setIsConfirmModalOpen(false);
    setRecordIdToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setRecordIdToDelete(null);
  };

  const handleImportData = async (importedData: any[]) => {
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
      try {
        let batch = writeBatch(db);
        let count = 0;
        
        for (const entry of parsedData) {
          const docRef = doc(collection(db, 'workEntries'));
          const { id, ...dataToSave } = entry;
          batch.set(docRef, dataToSave);
          count++;

          if (count === 400) {
            await batch.commit();
            batch = writeBatch(db);
            count = 0;
          }
        }
        
        if (count > 0) {
          await batch.commit();
        }
      } catch (error) {
         console.error("Error saving imported data", error);
         alert("Hubo un error al intentar guardar los datos importados en la nube.");
      }
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
    <div className="min-h-screen font-sans text-slate-800 dark:text-slate-200 flex flex-col">
      <div className="container mx-auto p-4 sm:p-6 md:p-8 flex-1">
        <Header theme={theme} setTheme={setTheme} />
        {isFirebaseLoading && workData.length === 0 ? (
          <div className="flex justify-center items-center h-64 mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : (
          <main className="mt-8 flex flex-col gap-8 flex-1">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-8">
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
        )}
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