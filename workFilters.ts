import type { Filters, WorkEntry } from './types';
import { MONTHS_ORDER } from './constants';

export const CATEGORIES = ['Mantenimiento', 'Limpieza', 'Electricidad', 'Elevador', 'Plomería', 'Jardinería', 'Administración', 'Otros', 'Sin categoría'];
export const categoryOf = (entry: WorkEntry) => entry.categoria?.trim() || 'Sin categoría';
export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const cleanMonth = (month: string) => {
  const value = normalize(month);
  return value === 'septiembr' ? 'septiembre' : value;
};
export function filterEntries(data: WorkEntry[], filters: Filters): WorkEntry[] {
  const terms = normalize(filters.search).split(/\s+/).filter(Boolean);
  return data.filter(item =>
    (!filters.year.length || filters.year.includes(String(item.ano))) &&
    (!filters.month.length || filters.month.some(month => cleanMonth(month) === cleanMonth(item.mes))) &&
    (!filters.person.length || filters.person.includes(item.persona)) &&
    (!filters.category.length || filters.category.includes(categoryOf(item))) &&
    terms.every(term => normalize(`${item.trabajo} ${item.persona} ${item.mes} ${item.ano} ${categoryOf(item)}`).includes(term))
  ).sort((a, b) => Number(a.ano) - Number(b.ano) ||
    monthIndex(a.mes) - monthIndex(b.mes));
}
const monthIndex = (month: string) => {
  const index = MONTHS_ORDER.findIndex(item => cleanMonth(item) === cleanMonth(month));
  return index < 0 ? 99 : index;
};
export function countBy(data: WorkEntry[], key: (entry: WorkEntry) => string) {
  const counts = new Map<string, number>();
  data.forEach(entry => counts.set(key(entry), (counts.get(key(entry)) || 0) + 1));
  return Array.from(counts, ([label, count]) => ({ label, count }));
}
export function monthCounts(data: WorkEntry[]) {
  const groups = new Map<string, { label: string; count: number; year: number; month: number }>();
  data.forEach(entry => {
    const month = monthIndex(entry.mes);
    const key = `${entry.ano}-${cleanMonth(entry.mes)}`;
    const current = groups.get(key);
    if (current) current.count++;
    else groups.set(key, { label: `${MONTHS_ORDER[month] || entry.mes} ${entry.ano}`, count: 1, year: Number(entry.ano), month });
  });
  return Array.from(groups.values()).sort((a, b) => a.year - b.year || a.month - b.month);
}
