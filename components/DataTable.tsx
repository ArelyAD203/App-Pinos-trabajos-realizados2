import React from 'react';
import type { WorkEntry } from '../types';

interface DataTableProps {
  data: WorkEntry[];
  hasActiveFilters: boolean;
  onDeleteEntry: (id: string) => void;
}

const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const DataTable: React.FC<DataTableProps> = ({ data, hasActiveFilters, onDeleteEntry }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <table className="w-full text-base text-left text-slate-600 dark:text-slate-300">
          <thead className="text-base text-white uppercase bg-blue-900 dark:bg-blue-950">
            <tr>
              <th scope="col" className="px-8 py-5 font-semibold transition-colors duration-300 ease-in-out hover:bg-blue-800 dark:hover:bg-blue-900/70 cursor-pointer">Mes</th>
              <th scope="col" className="px-8 py-5 font-semibold transition-colors duration-300 ease-in-out hover:bg-blue-800 dark:hover:bg-blue-900/70 cursor-pointer">Año</th>
              <th scope="col" className="px-8 py-5 font-semibold transition-colors duration-300 ease-in-out hover:bg-blue-800 dark:hover:bg-blue-900/70 cursor-pointer">Persona</th>
              <th scope="col" className="px-8 py-5 font-semibold transition-colors duration-300 ease-in-out hover:bg-blue-800 dark:hover:bg-blue-900/70 cursor-pointer">Trabajo Realizado</th>
              <th scope="col" className="px-8 py-5 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((entry, index) => (
                <tr 
                  key={entry.id} 
                  className="border-b dark:border-slate-700 even:bg-slate-50 dark:even:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-0.5 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-8 py-5 font-medium text-slate-900 dark:text-white whitespace-nowrap">{entry.mes}</td>
                  <td className="px-8 py-5">{entry.ano}</td>
                  <td className="px-8 py-5">{entry.persona}</td>
                  <td className="px-8 py-5 min-w-[350px]">{entry.trabajo}</td>
                  <td className="px-8 py-5 text-center">
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-colors duration-200"
                      aria-label="Eliminar registro"
                      title="Eliminar registro"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center px-8 py-24 text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-4 transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer">
                        <FilterIcon className="text-slate-400 dark:text-slate-500" />
                        <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                           {hasActiveFilters ? "No se encontraron resultados" : "Reporte listo para consulta"}
                        </p>
                        <p className="text-base">
                            {hasActiveFilters ? "Intente ajustar o limpiar los filtros para ver más datos." : "Seleccione uno o más filtros para comenzar a ver la información."}
                        </p>
                    </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-5 bg-slate-50 dark:bg-slate-800/80 text-base text-slate-600 dark:text-slate-400 border-t dark:border-slate-700">
        Mostrando {data.length} resultado(s)
      </div>
    </div>
  );
};

export default DataTable;