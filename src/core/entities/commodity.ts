export type CommodityCategory = 'pertanian' | 'peternakan' | 'perikanan' | 'perkebunan';

export type TrendDirection = 'up' | 'down' | 'stable';

export interface CommodityData {
  production: number;
  landArea: number;
  economicValue: number;
  productivityRate: number;
}

export interface HistoricalData {
  year: number;
  production: number;
  landArea: number;
  economicValue: number;
}

export interface RCAData {
  regionalProduction: number;
  nationalProduction: number;
  regionalTotal: number;
  nationalTotal: number;
  rcaScore: number;
}

export interface Commodity {
  id: string;
  name: string;
  category: CommodityCategory;
  regionId: string;
  data: CommodityData;
  historical: HistoricalData[];
  rcaData: RCAData;
}

export interface CommodityWithAnalysis extends Commodity {
  trend: TrendDirection;
  productivityScore: number;
  finalScore: number;
}

export function calculateTrend(historical: HistoricalData[]): TrendDirection {
  if (historical.length < 2) return 'stable';

  const recent = historical.slice(-3);
  const growthRates = recent.slice(1).map((item, index) => {
    const prev = recent[index];
    if (!prev || prev.production === 0) return 0;
    return ((item.production - prev.production) / prev.production) * 100;
  });

  const avgGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;

  if (avgGrowth > 2) return 'up';
  if (avgGrowth < -2) return 'down';
  return 'stable';
}

export function getRCAStatus(score: number): 'unggulan' | 'potensial' | 'rendah' {
  if (score >= 1) return 'unggulan';
  if (score >= 0.5) return 'potensial';
  return 'rendah';
}

export function getCategoryLabel(category: CommodityCategory): string {
  const labels: Record<CommodityCategory, string> = {
    pertanian: 'Pertanian',
    peternakan: 'Peternakan',
    perikanan: 'Perikanan',
    perkebunan: 'Perkebunan',
  };
  return labels[category];
}
