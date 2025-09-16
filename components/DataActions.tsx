import React, { useRef } from 'react';
import type { WorkEntry } from '../types';
import { MONTHS_ORDER } from '../constants';

declare global {
    interface Window {
        XLSX: any;
    }
}

interface DataActionsProps {
  fullData: WorkEntry[];
  onImport: (data: any[]) => void;
}

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const DataActions: React.FC<DataActionsProps> = ({ fullData, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (typeof window.XLSX === 'undefined') {
        alert('La librería de exportación no está disponible.');
        return;
    }

    const sortedData = [...fullData].sort((a, b) => {
      if (a.ano !== b.ano) {
        return a.ano - b.ano;
      }
      const monthAIndex = MONTHS_ORDER.indexOf(a.mes);
      const monthBIndex = MONTHS_ORDER.indexOf(b.mes);
      return monthAIndex - monthBIndex;
    });

    const worksheetData = sortedData.map(item => ({
        'Mes': item.mes,
        'Año': item.ano,
        'Persona': item.persona,
        'Trabajo Realizado': item.trabajo,
    }));
    
    const worksheet = window.XLSX.utils.json_to_sheet(worksheetData);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Trabajos');
    window.XLSX.writeFile(workbook, 'Reporte_Trabajos_Realizados.xlsx');
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        if (!fileData) throw new Error("No se pudo leer el archivo");
        const workbook = window.XLSX.read(fileData, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = window.XLSX.utils.sheet_to_json(worksheet);
        onImport(json);
      } catch (error) {
         console.error("Error al procesar el archivo Excel:", error);
         alert("Hubo un error al procesar el archivo. Asegúrese de que sea un archivo Excel válido.");
      } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Gestión de Datos</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={handleImportClick} className="flex-1 inline-flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 bg-[#9B5DE5] text-white hover:bg-[#8A49D1] hover:shadow-lg hover:shadow-purple-500/20 focus:outline-none focus:ring-2 focus:ring-[#9B5DE5] focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:-translate-y-0.5">
            <UploadIcon />
            Importar desde Excel
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".xlsx, .xls"
        />
        <button onClick={handleExport} className="flex-1 inline-flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl text-base font-semibold transition-all duration-300 bg-[#FF9F1C] text-white hover:bg-[#E68F19] hover:shadow-lg hover:shadow-orange-500/20 focus:outline-none focus:ring-2 focus:ring-[#FF9F1C] focus:ring-offset-2 dark:focus:ring-offset-slate-800 transform hover:-translate-y-0.5">
            <DownloadIcon />
            Descargar en Excel
        </button>
      </div>
    </div>
  );
};

export default DataActions;