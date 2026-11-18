export interface WorkEntry {
  id: string;
  mes: string;
  ano: number;
  persona: string;
  trabajo: string;
  categoria?: string;
}

export interface Filters {
  search: string;
  year: string[];
  month: string[];
  person: string[];
  category: string[];
}