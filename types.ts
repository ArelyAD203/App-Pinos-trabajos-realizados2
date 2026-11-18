export interface WorkEntry {
  id: string;
  mes: string;
  ano: number;
  persona: string;
  trabajo: string;
}

export interface Filters {
  search: string;
  year: string;
  month: string;
  person: string[];
}