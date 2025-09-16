import React from 'react';
import type { Filters } from '../types';
import { MONTHS_ORDER } from '../constants';

interface FilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  options: {
    years: number[];
    months: string[];
    people: string[];
  };
}

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="12" fill="#DBEAFE"/>
    <path d="M17.5 8H6.5C5.94772 8 5.5 8.44772 5.5 9V17C5.5 17.5523 5.94772 18 6.5 18H17.5C18.0523 18 18.5 17.5523 18.5 17V9C18.5 8.44772 18.0523 8 17.5 8Z" fill="#3B82F6"/>
    <path d="M14.5 6V10M9.5 6V10" stroke="#DBEAFE" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="12" fill="#D1FAE5"/>
    <path d="M17.5 8H6.5C5.94772 8 5.5 8.44772 5.5 9V17C5.5 17.5523 5.94772 18 6.5 18H17.5C18.0523 18 18.5 17.5523 18.5 17V9C18.5 8.44772 18.0523 8 17.5 8Z" fill="#059669"/>
    <path d="M14.5 6V10M9.5 6V10" stroke="#D1FAE5" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="9.5" cy="12.5" r="1" fill="#D1FAE5"/>
    <circle cx="14.5" cy="12.5" r="1" fill="#D1FAE5"/>
    <circle cx="9.5" cy="15.5" r="1" fill="#D1FAE5"/>
  </svg>
);

const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="12" fill="#FFEDD5"/>
    <circle cx="12" cy="10" r="3" fill="#F97316"/>
    <path d="M17 18C17 15.2386 14.7614 13 12 13C9.23858 13 7 15.2386 7 18" fill="#F97316"/>
  </svg>
);


const FilterButton: React.FC<{
  label: string | number;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => {
  const baseClasses = "w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-sm";
  const activeClasses = "bg-[#9B5DE5] text-white shadow-md shadow-purple-500/20 focus:ring-[#9B5DE5]";
  const inactiveClasses = "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600/60 hover:-translate-y-px";

  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {label}
    </button>
  );
};

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, options }) => {
  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setFilters({ year: 'all', month: 'all', person: 'all' });
  };

  const firstHalfMonths = options.months.filter(
    (month) => MONTHS_ORDER.indexOf(month) < 6
  );
  const secondHalfMonths = options.months.filter(
    (month) => MONTHS_ORDER.indexOf(month) >= 6
  );

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8">
        {/* Year Kanban Column */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-3 text-base font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase transition-transform duration-300 ease-in-out hover:translate-x-1">
            <CalendarIcon />
            Año
            </h3>
          <div className="flex flex-col gap-2">
            <FilterButton
              label="Todos"
              isActive={filters.year === 'all'}
              onClick={() => handleFilterChange('year', 'all')}
            />
            {options.years.map(year => (
              <FilterButton
                key={year}
                label={year}
                isActive={String(filters.year) === String(year)}
                onClick={() => handleFilterChange('year', String(year))}
              />
            ))}
          </div>
        </div>

        {/* Month Kanban Column */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-3 text-base font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase transition-transform duration-300 ease-in-out hover:translate-x-1">
            <CalendarDaysIcon />
            Mes
            </h3>
          <div className="flex flex-col gap-2">
            <FilterButton
              label="Todos"
              isActive={filters.month === 'all'}
              onClick={() => handleFilterChange('month', 'all')}
            />
            <div className="grid grid-cols-2 gap-x-2">
              <div className="flex flex-col gap-2">
                {firstHalfMonths.map(month => (
                  <FilterButton
                    key={month}
                    label={month}
                    isActive={filters.month === month}
                    onClick={() => handleFilterChange('month', month)}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {secondHalfMonths.map(month => (
                  <FilterButton
                    key={month}
                    label={month}
                    isActive={filters.month === month}
                    onClick={() => handleFilterChange('month', month)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Person Kanban Column */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-3 text-base font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase transition-transform duration-300 ease-in-out hover:translate-x-1">
            <UserIcon />
            Persona
            </h3>
          <div className="flex flex-col gap-2">
            <FilterButton
              label="Todos"
              isActive={filters.person === 'all'}
              onClick={() => handleFilterChange('person', 'all')}
            />
            {options.people.map(person => (
              <FilterButton
                key={person}
                label={person}
                isActive={filters.person === person}
                onClick={() => handleFilterChange('person', person)}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-700 flex justify-end">
         <button 
            onClick={resetFilters}
            className="text-sm font-semibold text-[#9B5DE5] dark:text-purple-400 hover:underline focus:outline-none transition-transform duration-200 ease-in-out hover:scale-105"
          >
            Limpiar Todos los Filtros
          </button>
      </div>
    </div>
  );
};

export default FilterPanel;