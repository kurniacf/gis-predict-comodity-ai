import type {
  RegionSurplusDeficit,
  MarketTarget,
  MarketAnalysisResult,
} from '../entities/market-analysis';
import {
  getFeasibilityScore,
  generateMarketInsights,
} from '../entities/market-analysis';

export function findDeficitRegions(
  allRegions: RegionSurplusDeficit[],
  commodityId: string
): RegionSurplusDeficit[] {
  return allRegions
    .filter((r) => r.commodityId === commodityId && r.status === 'deficit')
    .sort((a, b) => a.surplus - b.surplus);
}

export function findSurplusRegions(
  allRegions: RegionSurplusDeficit[],
  commodityId: string
): RegionSurplusDeficit[] {
  return allRegions
    .filter((r) => r.commodityId === commodityId && r.status === 'surplus')
    .sort((a, b) => b.surplus - a.surplus);
}

export function generateTargetMarkets(
  deficitRegions: RegionSurplusDeficit[],
  sourceCoordinates?: [number, number]
): MarketTarget[] {
  return deficitRegions.map((region, index) => {
    const distance = sourceCoordinates
      ? estimateDistance(sourceCoordinates, getRegionCoordinates(region.regionId))
      : undefined;

    return {
      rank: index + 1,
      regionId: region.regionId,
      regionName: region.regionName,
      province: region.province,
      deficitAmount: region.surplus,
      estimatedDemand: Math.abs(region.surplus),
      distance,
      feasibility: getFeasibilityScore(Math.abs(region.surplus), distance),
    };
  });
}

export function analyzeMarket(
  sourceRegion: RegionSurplusDeficit,
  allRegions: RegionSurplusDeficit[]
): MarketAnalysisResult {
  const deficitRegions = findDeficitRegions(allRegions, sourceRegion.commodityId);
  const targetMarkets = generateTargetMarkets(deficitRegions);

  const insights = generateMarketInsights(
    sourceRegion.regionName,
    sourceRegion.surplus,
    targetMarkets
  );

  const totalPotentialDemand = targetMarkets.reduce(
    (sum, t) => sum + Math.abs(t.deficitAmount),
    0
  );

  return {
    sourceCommodity: sourceRegion.commodityId,
    sourceRegion: sourceRegion.regionName,
    availableSurplus: sourceRegion.surplus,
    targetMarkets,
    insights,
    totalPotentialDemand,
  };
}

export function calculateDistributionPlan(
  availableSurplus: number,
  targetMarkets: MarketTarget[]
): Array<{ market: MarketTarget; allocatedAmount: number }> {
  const plan: Array<{ market: MarketTarget; allocatedAmount: number }> = [];
  let remainingSurplus = availableSurplus;

  const sortedMarkets = [...targetMarkets].sort((a, b) => {
    const scoreA = a.feasibility === 'high' ? 3 : a.feasibility === 'medium' ? 2 : 1;
    const scoreB = b.feasibility === 'high' ? 3 : b.feasibility === 'medium' ? 2 : 1;
    return scoreB - scoreA;
  });

  for (const market of sortedMarkets) {
    if (remainingSurplus <= 0) break;

    const allocatedAmount = Math.min(remainingSurplus, Math.abs(market.deficitAmount));
    plan.push({ market, allocatedAmount });
    remainingSurplus -= allocatedAmount;
  }

  return plan;
}

function estimateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371;
  const dLat = toRad(coord2[0] - coord1[0]);
  const dLon = toRad(coord2[1] - coord1[1]);
  const lat1 = toRad(coord1[0]);
  const lat2 = toRad(coord2[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function getRegionCoordinates(regionId: string): [number, number] {
  const coordinates: Record<string, [number, number]> = {
    jakarta: [-6.2088, 106.8456],
    'jabar-bandung': [-6.9175, 107.6191],
    'jatim-surabaya': [-7.2575, 112.7521],
    'banten-tangerang': [-6.1702, 106.6403],
    'jabar-bekasi': [-6.2383, 106.9756],
    'kalteng-kotim': [-2.5389, 112.9519],
    'sulsel-luwu': [-2.5500, 120.3500],
    'sumsel-oki': [-3.4167, 105.0833],
    'lampung-mesuji': [-3.9667, 105.5833],
    'papua-merauke': [-8.4833, 140.4000],
  };

  return coordinates[regionId] || [-2.5489, 118.0149];
}

export function getSurplusDeficitSummary(
  regions: RegionSurplusDeficit[]
): {
  totalSurplus: number;
  totalDeficit: number;
  surplusCount: number;
  deficitCount: number;
  balancedCount: number;
} {
  let totalSurplus = 0;
  let totalDeficit = 0;
  let surplusCount = 0;
  let deficitCount = 0;
  let balancedCount = 0;

  regions.forEach((region) => {
    if (region.status === 'surplus') {
      totalSurplus += region.surplus;
      surplusCount++;
    } else if (region.status === 'deficit') {
      totalDeficit += Math.abs(region.surplus);
      deficitCount++;
    } else {
      balancedCount++;
    }
  });

  return {
    totalSurplus,
    totalDeficit,
    surplusCount,
    deficitCount,
    balancedCount,
  };
}
