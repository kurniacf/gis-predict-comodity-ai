import { create } from 'zustand';

import type { CommodityWithAnalysis, CommodityCategory } from '@/core/entities/commodity';
import type { Province, Regency, District } from '@/core/entities/region';

interface CommodityFilters {
  category: CommodityCategory | 'all';
  minRCA: number;
  sortBy: 'rca' | 'productivity' | 'final' | 'name';
  searchQuery: string;
}

interface LocationSelection {
  province: Province | null;
  regency: Regency | null;
  district: District | null;
}

interface CommodityState {
  commodities: CommodityWithAnalysis[];
  selectedCommodity: CommodityWithAnalysis | null;
  location: LocationSelection;
  filters: CommodityFilters;
  isLoading: boolean;

  setCommodities: (commodities: CommodityWithAnalysis[]) => void;
  selectCommodity: (commodity: CommodityWithAnalysis | null) => void;
  setLocation: (location: Partial<LocationSelection>) => void;
  setFilters: (filters: Partial<CommodityFilters>) => void;
  resetFilters: () => void;
  setLoading: (isLoading: boolean) => void;
}

const defaultFilters: CommodityFilters = {
  category: 'all',
  minRCA: 0,
  sortBy: 'final',
  searchQuery: '',
};

export const useCommodityStore = create<CommodityState>((set) => ({
  commodities: [],
  selectedCommodity: null,
  location: {
    province: null,
    regency: null,
    district: null,
  },
  filters: defaultFilters,
  isLoading: false,

  setCommodities: (commodities) => set({ commodities }),

  selectCommodity: (commodity) => set({ selectedCommodity: commodity }),

  setLocation: (location) =>
    set((state) => ({
      location: { ...state.location, ...location },
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: defaultFilters }),

  setLoading: (isLoading) => set({ isLoading }),
}));

export function getFilteredCommodities(state: CommodityState): CommodityWithAnalysis[] {
  let filtered = [...state.commodities];

  if (state.filters.category !== 'all') {
    filtered = filtered.filter((c) => c.category === state.filters.category);
  }

  if (state.filters.minRCA > 0) {
    filtered = filtered.filter((c) => c.rcaData.rcaScore >= state.filters.minRCA);
  }

  if (state.filters.searchQuery) {
    const query = state.filters.searchQuery.toLowerCase();
    filtered = filtered.filter((c) => c.name.toLowerCase().includes(query));
  }

  switch (state.filters.sortBy) {
    case 'rca':
      filtered.sort((a, b) => b.rcaData.rcaScore - a.rcaData.rcaScore);
      break;
    case 'productivity':
      filtered.sort((a, b) => b.productivityScore - a.productivityScore);
      break;
    case 'name':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'final':
    default:
      filtered.sort((a, b) => b.finalScore - a.finalScore);
      break;
  }

  return filtered;
}
