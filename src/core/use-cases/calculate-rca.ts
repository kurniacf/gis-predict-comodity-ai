import type { Commodity, CommodityWithAnalysis } from '../entities/commodity';
import { calculateTrend } from '../entities/commodity';

export function calculateRCA(
  regionalProduction: number,
  regionalTotal: number,
  nationalProduction: number,
  nationalTotal: number
): number {
  if (regionalTotal === 0 || nationalTotal === 0 || nationalProduction === 0) {
    return 0;
  }

  const regionalShare = regionalProduction / regionalTotal;
  const nationalShare = nationalProduction / nationalTotal;

  return regionalShare / nationalShare;
}

export function calculateProductivityScore(
  actualProductivity: number,
  nationalAverageProductivity: number
): number {
  if (nationalAverageProductivity === 0) return 0;
  return (actualProductivity / nationalAverageProductivity) * 100;
}

export function calculateFinalScore(
  rcaScore: number,
  productivityScore: number,
  weights: { rca: number; productivity: number } = { rca: 0.6, productivity: 0.4 }
): number {
  const normalizedRCA = Math.min(rcaScore, 10) / 10;
  const normalizedProductivity = Math.min(productivityScore, 200) / 200;

  return (normalizedRCA * weights.rca + normalizedProductivity * weights.productivity) * 100;
}

export function enrichCommodityWithAnalysis(
  commodity: Commodity,
  nationalAverageProductivity: number = 5.0
): CommodityWithAnalysis {
  const trend = calculateTrend(commodity.historical);
  const productivityScore = calculateProductivityScore(
    commodity.data.productivityRate,
    nationalAverageProductivity
  );
  const finalScore = calculateFinalScore(commodity.rcaData.rcaScore, productivityScore);

  return {
    ...commodity,
    trend,
    productivityScore,
    finalScore,
  };
}

export function rankCommodities(
  commodities: CommodityWithAnalysis[],
  sortBy: 'rca' | 'productivity' | 'final' = 'final'
): CommodityWithAnalysis[] {
  return [...commodities].sort((a, b) => {
    switch (sortBy) {
      case 'rca':
        return b.rcaData.rcaScore - a.rcaData.rcaScore;
      case 'productivity':
        return b.productivityScore - a.productivityScore;
      case 'final':
      default:
        return b.finalScore - a.finalScore;
    }
  });
}

export function filterTopCommodities(
  commodities: CommodityWithAnalysis[],
  minRCA: number = 1.0,
  limit?: number
): CommodityWithAnalysis[] {
  const filtered = commodities.filter((c) => c.rcaData.rcaScore >= minRCA);
  return limit ? filtered.slice(0, limit) : filtered;
}
