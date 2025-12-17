export type SurplusDeficitStatus = 'surplus' | 'deficit' | 'balanced';

export interface RegionSurplusDeficit {
  regionId: string;
  regionName: string;
  province: string;
  commodityId: string;
  production: number;
  consumption: number;
  population: number;
  consumptionPerCapita: number;
  surplus: number;
  status: SurplusDeficitStatus;
}

export interface MarketTarget {
  rank: number;
  regionId: string;
  regionName: string;
  province: string;
  deficitAmount: number;
  estimatedDemand: number;
  distance?: number;
  feasibility: 'high' | 'medium' | 'low';
}

export interface MarketAnalysisResult {
  sourceCommodity: string;
  sourceRegion: string;
  availableSurplus: number;
  targetMarkets: MarketTarget[];
  insights: string[];
  totalPotentialDemand: number;
}

export function calculateSurplusDeficit(
  production: number,
  consumption: number
): { surplus: number; status: SurplusDeficitStatus } {
  const surplus = production - consumption;
  let status: SurplusDeficitStatus;

  if (surplus > consumption * 0.1) {
    status = 'surplus';
  } else if (surplus < -consumption * 0.1) {
    status = 'deficit';
  } else {
    status = 'balanced';
  }

  return { surplus, status };
}

export function getStatusColor(status: SurplusDeficitStatus): string {
  const colors: Record<SurplusDeficitStatus, string> = {
    surplus: 'success',
    deficit: 'destructive',
    balanced: 'warning',
  };
  return colors[status];
}

export function getStatusLabel(status: SurplusDeficitStatus): string {
  const labels: Record<SurplusDeficitStatus, string> = {
    surplus: 'Surplus',
    deficit: 'Defisit',
    balanced: 'Seimbang',
  };
  return labels[status];
}

export function getFeasibilityScore(
  deficitAmount: number,
  distance?: number
): 'high' | 'medium' | 'low' {
  if (!distance) return 'medium';

  const efficiencyScore = deficitAmount / (distance || 1);

  if (efficiencyScore > 1000) return 'high';
  if (efficiencyScore > 100) return 'medium';
  return 'low';
}

export function generateMarketInsights(
  sourceRegion: string,
  availableSurplus: number,
  targetMarkets: MarketTarget[]
): string[] {
  const insights: string[] = [];

  if (targetMarkets.length === 0) {
    insights.push('Tidak ditemukan pasar potensial dengan defisit signifikan.');
    return insights;
  }

  const topTarget = targetMarkets[0];
  if (topTarget) {
    insights.push(
      `${topTarget.regionName} adalah pasar potensial utama dengan defisit ${formatNumber(Math.abs(topTarget.deficitAmount))} ton.`
    );
  }

  const totalDemand = targetMarkets.reduce((sum, t) => sum + Math.abs(t.deficitAmount), 0);
  const coverageCount = targetMarkets.filter(
    (t, i) =>
      targetMarkets.slice(0, i + 1).reduce((s, m) => s + Math.abs(m.deficitAmount), 0) <=
      availableSurplus
  ).length;

  if (coverageCount > 0) {
    insights.push(
      `Surplus ${formatNumber(availableSurplus)} ton dapat memenuhi kebutuhan ${coverageCount} wilayah defisit.`
    );
  }

  if (availableSurplus >= totalDemand) {
    insights.push('Surplus wilayah cukup untuk memenuhi seluruh kebutuhan pasar potensial.');
  } else {
    const coverage = ((availableSurplus / totalDemand) * 100).toFixed(1);
    insights.push(`Surplus dapat memenuhi ${coverage}% dari total kebutuhan pasar potensial.`);
  }

  const highFeasibility = targetMarkets.filter((t) => t.feasibility === 'high');
  if (highFeasibility.length > 0) {
    insights.push(
      `${highFeasibility.length} pasar memiliki kelayakan distribusi tinggi.`
    );
  }

  return insights;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}
