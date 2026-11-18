import type { WorkEntry } from './types';
import { MONTHS_ORDER } from './constants';
import { cleanMonth } from './workFilters';
export function parseImport(rows: Record<string, unknown>[]): WorkEntry[] {
  if (!rows.length) throw new Error('El archivo está vacío. No se reemplazó ningún registro.');
  return rows.map((raw, index) => {
    const row: Record<string, unknown> = {};
    Object.entries(raw).forEach(([key, value]) => { row[key.toLowerCase().trim()] = value; });
    const text = (...keys: string[]) => String(keys.map(key => row[key]).find(value => value !== undefined && value !== null) ?? '').trim();
    const year = text('año', 'ano');
    const month = MONTHS_ORDER.find(value => cleanMonth(value) === cleanMonth(text('mes')));
    const persona = text('persona');
    const trabajo = text('trabajo realizado', 'trabajo');
    if (!/^\d{4}$/.test(year) || !month || !persona || !trabajo) {
      throw new Error(`Fila ${index + 2}: revisa Año (4 dígitos), Mes, Persona y Trabajo Realizado. No se importó el archivo.`);
    }
    return { id: crypto.randomUUID(), ano: Number(year), mes: month, persona, trabajo, categoria: text('categoría', 'categoria') || 'Sin categoría' };
  });
}
