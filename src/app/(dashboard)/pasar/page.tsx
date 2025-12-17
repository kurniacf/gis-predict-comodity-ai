'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { TrendingUp, TrendingDown, Scale, Target } from 'lucide-react';

import type { Commodity } from '@/core/entities/commodity';
import type { RegionSurplusDeficit, MarketAnalysisResult } from '@/core/entities/market-analysis';
import type { RegionData } from '@/core/entities/region';
import { getStatusLabel } from '@/core/entities/market-analysis';
import { enrichCommodityWithAnalysis } from '@/core/use-cases/calculate-rca';
import {
  analyzeMarket,
  findSurplusRegions,
  getSurplusDeficitSummary,
} from '@/core/use-cases/analyze-surplus-deficit';
import commoditiesData from '@/data/commodities.json';
import nationalData from '@/data/national-data.json';
import regionsData from '@/data/regions.json';
import { formatNumber } from '@/shared/utils/formatters';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { MarketTargetTable } from '@/presentation/components/tables/market-target-table';
import { SurplusDeficitChart, SurplusDeficitSummaryChart } from '@/presentation/components/charts/surplus-deficit-chart';
import { InsightList } from '@/presentation/components/cards/insight-card';

const InteractiveMap = dynamic(
  () =>
    import('@/presentation/components/maps/interactive-map').then(
      (mod) => mod.InteractiveMap
    ),
  { ssr: false, loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" /> }
);

export default function PasarPage() {
  const [selectedCommodityId, setSelectedCommodityId] = React.useState<string>('padi');
  const [marketAnalysis, setMarketAnalysis] = React.useState<MarketAnalysisResult | null>(null);

  const provinces = (regionsData as RegionData).provinces;
  const surplusDeficitData = nationalData.surplusDeficitData as RegionSurplusDeficit[];

  const enrichedCommodities = React.useMemo(() => {
    return (commoditiesData.commodities as Commodity[]).map((c) =>
      enrichCommodityWithAnalysis(c)
    );
  }, []);

  const filteredSurplusDeficit = React.useMemo(() => {
    return surplusDeficitData.filter((r) => r.commodityId === selectedCommodityId);
  }, [surplusDeficitData, selectedCommodityId]);

  const summary = React.useMemo(() => {
    return getSurplusDeficitSummary(filteredSurplusDeficit);
  }, [filteredSurplusDeficit]);

  const surplusRegions = React.useMemo(() => {
    return findSurplusRegions(filteredSurplusDeficit, selectedCommodityId);
  }, [filteredSurplusDeficit, selectedCommodityId]);

  React.useEffect(() => {
    if (surplusRegions.length > 0 && surplusRegions[0]) {
      const analysis = analyzeMarket(surplusRegions[0], filteredSurplusDeficit);
      setMarketAnalysis(analysis);
    } else {
      setMarketAnalysis(null);
    }
  }, [surplusRegions, filteredSurplusDeficit]);

  const selectedSourceRegion = surplusRegions[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analisis Potensi Pasar</h1>
        <p className="text-muted-foreground">
          Analisis surplus-defisit dan identifikasi pasar potensial
        </p>
      </div>

      {/* Commodity Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Pilih Komoditas</label>
              <Select
                value={selectedCommodityId}
                onValueChange={setSelectedCommodityId}
              >
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Pilih komoditas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="padi">Padi</SelectItem>
                  <SelectItem value="jagung">Jagung</SelectItem>
                  <SelectItem value="karet">Karet</SelectItem>
                  <SelectItem value="sawit">Kelapa Sawit</SelectItem>
                  <SelectItem value="kakao">Kakao</SelectItem>
                  <SelectItem value="kopi">Kopi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Surplus
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(summary.totalSurplus)} ton
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              dari {summary.surplusCount} wilayah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Defisit
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatNumber(summary.totalDeficit)} ton
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              dari {summary.deficitCount} wilayah
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Neraca Nasional
            </CardTitle>
            <Scale className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              'text-2xl font-bold',
              summary.totalSurplus - summary.totalDeficit >= 0
                ? 'text-green-600'
                : 'text-red-600'
            )}>
              {summary.totalSurplus - summary.totalDeficit >= 0 ? '+' : ''}
              {formatNumber(summary.totalSurplus - summary.totalDeficit)} ton
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              selisih surplus-defisit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pasar Potensial
            </CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {marketAnalysis?.targetMarkets.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              wilayah defisit dapat dijangkau
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source Region Info */}
      {selectedSourceRegion && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="success">Wilayah Surplus</Badge>
              {selectedSourceRegion.regionName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Provinsi</p>
                <p className="font-medium">{selectedSourceRegion.province}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produksi</p>
                <p className="font-medium">{formatNumber(selectedSourceRegion.production)} ton</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Konsumsi Lokal</p>
                <p className="font-medium">{formatNumber(selectedSourceRegion.consumption)} ton</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Surplus Tersedia</p>
                <p className="font-medium text-green-600">
                  {formatNumber(selectedSourceRegion.surplus)} ton
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">Grafik Surplus-Defisit</TabsTrigger>
          <TabsTrigger value="target">Target Pasar</TabsTrigger>
          <TabsTrigger value="map">Peta Distribusi</TabsTrigger>
          <TabsTrigger value="insight">Insight</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Distribusi Surplus-Defisit per Wilayah
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SurplusDeficitChart data={filteredSurplusDeficit} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan Status Wilayah</CardTitle>
              </CardHeader>
              <CardContent>
                <SurplusDeficitSummaryChart
                  surplusCount={summary.surplusCount}
                  deficitCount={summary.deficitCount}
                  balancedCount={summary.balancedCount}
                />
                <div className="mt-4 space-y-2">
                  {filteredSurplusDeficit.slice(0, 5).map((region) => (
                    <div
                      key={region.regionId}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <div>
                        <p className="font-medium text-sm">{region.regionName}</p>
                        <p className="text-xs text-muted-foreground">{region.province}</p>
                      </div>
                      <Badge
                        variant={
                          region.status === 'surplus'
                            ? 'success'
                            : region.status === 'deficit'
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {getStatusLabel(region.status)}: {formatNumber(Math.abs(region.surplus))} ton
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="target" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Target Pasar Potensial
                {selectedSourceRegion && (
                  <span className="text-muted-foreground font-normal text-sm ml-2">
                    dari {selectedSourceRegion.regionName}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {marketAnalysis && marketAnalysis.targetMarkets.length > 0 ? (
                <MarketTargetTable targets={marketAnalysis.targetMarkets} />
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Tidak ditemukan pasar potensial
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Peta Distribusi Pasar</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px]">
                <InteractiveMap
                  provinces={provinces}
                  commodities={enrichedCommodities}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insight" className="mt-4">
          {marketAnalysis ? (
            <InsightList insights={marketAnalysis.insights} type="info" />
          ) : (
            <Card className="py-12">
              <CardContent className="text-center text-muted-foreground">
                Pilih komoditas untuk melihat insight pasar
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
