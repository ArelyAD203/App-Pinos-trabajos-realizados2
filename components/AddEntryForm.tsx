import React, { useState } from 'react';
import { CATEGORIES } from '../workFilters';
import type { WorkEntry } from '../types';

interface AddEntryFormProps {
  onAddEntry: (entry: Omit<WorkEntry, 'id' | 'ano'> & { ano: number | string }) => Promise<void>;
  busy: boolean;
  peopleOptions: string[];
  monthOptions: string[];
}

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
);

const AddEntryForm: React.FC<AddEntryFormProps> = ({ onAddEntry, peopleOptions, monthOptions, busy }) => {
  const initialFormState = {
    ano: new Date().getFullYear().toString(),
    mes: monthOptions[0] || '',
    persona: '',
    trabajo: '',
    categoria: 'Sin categoría',
    newPerson: '',
  };
  const [formData, setFormData] = useState(initialFormState);
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'persona') {
      setShowNewPerson(value === 'Otro');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const { ano, mes, persona, trabajo, newPerson } = formData;

    if (!ano || !mes || !trabajo) {
      setError('Año, Mes y Trabajo realizado son campos obligatorios.');
      return;
    }
    if (persona === '') {
      setError('Debe seleccionar o añadir una persona.');
      return;
    }
    if (persona === 'Otro' && !newPerson.trim()) {
      setError('Debe especificar el nombre de la nueva persona.');
      return;
    }
    
    const finalPerson = persona === 'Otro' ? newPerson.trim() : persona;

    try {
      await onAddEntry({ ano, mes, persona: finalPerson, trabajo, categoria: formData.categoria });
      setFormData(initialFormState);
      setShowNewPerson(false);
    } catch { setError('No se pudo guardar. Conservamos tus datos para que puedas volver a intentar.'); }
  };

  const inputClasses = "w-full p-3 rounded-xl text-base bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 focus:ring-2 focus:ring-[#9B5DE5] focus:border-transparent transition-all duration-200";

  return (
    <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600">
       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Añadir Nuevo Registro</h3>
      <form onSubmit={handleSubmit}><fieldset disabled={busy} className="space-y-6 disabled:opacity-60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group">
              <label htmlFor="ano" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors duration-300 group-hover:text-[#9B5DE5] dark:group-hover:text-purple-400">Año</label>
              <input type="number" name="ano" id="ano" value={formData.ano} onChange={handleInputChange} className={inputClasses} required />
            </div>
            <div className="group">
                <label htmlFor="mes" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors duration-300 group-hover:text-[#9B5DE5] dark:group-hover:text-purple-400">Mes</label>
                <select name="mes" id="mes" value={formData.mes} onChange={handleInputChange} className={inputClasses} required>
                    {monthOptions.map(month => <option key={month} value={month}>{month}</option>)}
                </select>
            </div>
            <div className="group">
                 <label htmlFor="persona" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors duration-300 group-hover:text-[#9B5DE5] dark:group-hover:text-purple-400">Persona</label>
                 <select name="persona" id="persona" value={formData.persona} onChange={handleInputChange} className={inputClasses} required>
                    <option value="" disabled>Seleccionar...</option>
                    {peopleOptions.map(person => <option key={person} value={person}>{person}</option>)}
                    <option value="Otro">Otro...</option>
                 </select>
            </div>
        </div>

        {showNewPerson && (
             <div className="animate-fade-in-up group">
                <label htmlFor="newPerson" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors duration-300 group-hover:text-[#9B5DE5] dark:group-hover:text-purple-400">Nombre de la nueva persona</label>
                <input type="text" name="newPerson" id="newPerson" value={formData.newPerson} onChange={handleInputChange} className={inputClasses} placeholder="Escriba el nombre" required />
            </div>
        )}

        <div>
          <label htmlFor="categoria" className="block mb-2 font-medium">Categoría de trabajo</label>
          <select id="categoria" name="categoria" value={formData.categoria} onChange={handleInputChange} className={inputClasses}>
            {CATEGORIES.map(category => <option key={category}>{category}</option>)}
          </select>
        </div>
        <div className="group">
             <label htmlFor="trabajo" className="block text-base font-medium text-slate-600 dark:text-slate-300 mb-2 transition-colors duration-300 group-hover:text-[#9B5DE5] dark:group-hover:text-purple-400">Trabajo Realizado</label>
             <textarea name="trabajo" id="trabajo" value={formData.trabajo} onChange={handleInputChange} rows={4} className={inputClasses} required></textarea>
        </div>

        {error && <p className="text-base text-red-500 dark:text-red-400">{error}</p>}
        
        <div className="text-right pt-2">
            <button type="submit" className="inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 bg-[#A3D900] text-slate-800 hover:bg-[#92BF00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-500 focus:ring-2 focus:ring-[#A3D900] focus:ring-offset-2 dark:focus:ring-offset-slate-800 hover:shadow-lg hover:shadow-lime-500/20 transform hover:-translate-y-1">
                <PlusIcon />
                {busy ? 'Guardando…' : 'Guardar Registro'}
            </button>
        </div>
      </fieldset></form>
    </div>
  );
};

export default AddEntryForm;