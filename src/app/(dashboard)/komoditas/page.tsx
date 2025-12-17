'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Filter, LayoutGrid, List } from 'lucide-react';

import type { Commodity, CommodityWithAnalysis } from '@/core/entities/commodity';
import type { Province, Regency, District, RegionData } from '@/core/entities/region';
import { enrichCommodityWithAnalysis, rankCommodities } from '@/core/use-cases/calculate-rca';
import commoditiesData from '@/data/commodities.json';
import regionsData from '@/data/regions.json';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { ScrollArea } from '@/presentation/components/ui/scroll-area';
import { Input } from '@/presentation/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { LocationSelector } from '@/presentation/components/forms/location-selector';
import { CommodityCard, CommodityListItem } from '@/presentation/components/cards/commodity-card';
import { CommodityRankingTable } from '@/presentation/components/tables/commodity-ranking-table';
import { ProductivityTrend } from '@/presentation/components/charts/productivity-trend';
import { RCAComparison } from '@/presentation/components/charts/rca-comparison';
import { InsightCard } from '@/presentation/components/cards/insight-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';

const InteractiveMap = dynamic(
  () =>
    import('@/presentation/components/maps/interactive-map').then(
      (mod) => mod.InteractiveMap
    ),
  { ssr: false, loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" /> }
);

export default function KomoditasPage() {
  const [selectedProvince, setSelectedProvince] = React.useState<Province | null>(null);
  const [selectedRegency, setSelectedRegency] = React.useState<Regency | null>(null);
  const [selectedDistrict, setSelectedDistrict] = React.useState<District | null>(null);
  const [selectedCommodity, setSelectedCommodity] = React.useState<CommodityWithAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list');
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const provinces = (regionsData as RegionData).provinces;

  const enrichedCommodities = React.useMemo(() => {
    return (commoditiesData.commodities as Commodity[]).map((c) =>
      enrichCommodityWithAnalysis(c)
    );
  }, []);

  const filteredCommodities = React.useMemo(() => {
    let filtered = enrichedCommodities;

    if (selectedRegency) {
      filtered = filtered.filter((c) => c.regionId === selectedRegency.id);
    } else if (selectedProvince) {
      const regencyIds = selectedProvince.regencies.map((r) => r.id);
      filtered = filtered.filter((c) => regencyIds.includes(c.regionId));
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) => c.name.toLowerCase().includes(query));
    }

    return rankCommodities(filtered);
  }, [enrichedCommodities, selectedProvince, selectedRegency, categoryFilter, searchQuery]);

  const topCommodities = filteredCommodities.filter((c) => c.rcaData.rcaScore >= 1);

  const generateInsights = () => {
    const insights: Array<{ type: 'success' | 'warning' | 'info' | 'tip'; title: string; description: string }> = [];

    if (topCommodities.length > 0) {
      const top = topCommodities[0];
      if (top) {
        insights.push({
          type: 'success',
          title: 'Komoditas Unggulan Tertinggi',
          description: `${top.name} memiliki RCA tertinggi (${top.rcaData.rcaScore.toFixed(2)}) dengan produktivitas ${top.data.productivityRate.toFixed(2)} ton/ha.`,
        });
      }
    }

    const growingCommodities = filteredCommodities.filter((c) => c.trend === 'up');
    if (growingCommodities.length > 0) {
      insights.push({
        type: 'info',
        title: 'Tren Positif',
        description: `${growingCommodities.length} komoditas menunjukkan tren pertumbuhan positif dalam 5 tahun terakhir.`,
      });
    }

    const potentialCommodities = filteredCommodities.filter(
      (c) => c.rcaData.rcaScore >= 0.8 && c.rcaData.rcaScore < 1
    );
    if (potentialCommodities.length > 0) {
      insights.push({
        type: 'tip',
        title: 'Komoditas Potensial',
        description: `${potentialCommodities.length} komoditas memiliki potensi menjadi unggulan dengan sedikit peningkatan.`,
      });
    }

    return insights;
  };

  const handleCommodityClick = (commodity: CommodityWithAnalysis) => {
    setSelectedCommodity(commodity);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Identifikasi Komoditas Unggulan</h1>
        <p className="text-muted-foreground">
          Analisis dan pemetaan komoditas unggulan kawasan transmigrasi
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Location & Filters */}
        <div className="space-y-6">
          <LocationSelector
            provinces={provinces}
            selectedProvince={selectedProvince}
            selectedRegency={selectedRegency}
            selectedDistrict={selectedDistrict}
            onProvinceChange={setSelectedProvince}
            onRegencyChange={setSelectedRegency}
            onDistrictChange={setSelectedDistrict}
          />

          {/* Filters */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cari Komoditas</label>
                <Input
                  placeholder="Ketik nama komoditas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategori</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    <SelectItem value="pertanian">Pertanian</SelectItem>
                    <SelectItem value="perkebunan">Perkebunan</SelectItem>
                    <SelectItem value="peternakan">Peternakan</SelectItem>
                    <SelectItem value="perikanan">Perikanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Commodity List */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">
                Komoditas ({filteredCommodities.length})
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="p-4 space-y-2">
                  {filteredCommodities.map((commodity, index) => (
                    <CommodityListItem
                      key={commodity.id}
                      commodity={commodity}
                      rank={index + 1}
                      onClick={() => handleCommodityClick(commodity)}
                      isSelected={selectedCommodity?.id === commodity.id}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Map */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Peta Kawasan Transmigrasi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px]">
                <InteractiveMap
                  provinces={provinces}
                  commodities={enrichedCommodities}
                  selectedRegionId={selectedRegency?.id || selectedProvince?.id}
                  onRegionSelect={(regionId) => {
                    const province = provinces.find((p) =>
                      p.regencies.some((r) => r.id === regionId)
                    );
                    if (province) {
                      setSelectedProvince(province);
                      const regency = province.regencies.find((r) => r.id === regionId);
                      if (regency) setSelectedRegency(regency);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Tabs */}
          <Tabs defaultValue="ranking">
            <TabsList>
              <TabsTrigger value="ranking">Ranking Komoditas</TabsTrigger>
              <TabsTrigger value="rca">Analisis RCA</TabsTrigger>
              <TabsTrigger value="trend">Tren Produktivitas</TabsTrigger>
              <TabsTrigger value="insight">Insight</TabsTrigger>
            </TabsList>

            <TabsContent value="ranking" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <CommodityRankingTable
                    commodities={filteredCommodities}
                    onRowClick={handleCommodityClick}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rca" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Perbandingan RCA Komoditas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RCAComparison commodities={filteredCommodities} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trend" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Tren Produktivitas{' '}
                    {selectedCommodity ? `- ${selectedCommodity.name}` : ''}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCommodity ? (
                    <ProductivityTrend
                      data={selectedCommodity.historical}
                      commodityName={selectedCommodity.name}
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Pilih komoditas untuk melihat tren produktivitas
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insight" className="mt-4">
              <div className="space-y-4">
                {generateInsights().map((insight, index) => (
                  <InsightCard
                    key={index}
                    type={insight.type}
                    title={insight.title}
                    description={insight.description}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Commodity Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCommodity?.name}</DialogTitle>
          </DialogHeader>
          {selectedCommodity && (
            <div className="space-y-6">
              <CommodityCard commodity={selectedCommodity} />
              <div>
                <h4 className="font-semibold mb-4">Tren Produksi 5 Tahun</h4>
                <ProductivityTrend
                  data={selectedCommodity.historical}
                  commodityName={selectedCommodity.name}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
