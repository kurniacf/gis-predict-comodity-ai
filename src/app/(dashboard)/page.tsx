'use client';

import * as React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Map,
  ClipboardCheck,
  TrendingUp,
  Wheat,
  TreePine,
  Fish,
  Beef,
  ArrowRight,
  Award,
} from 'lucide-react';

import type { Commodity } from '@/core/entities/commodity';
import type { RegionData } from '@/core/entities/region';
import { enrichCommodityWithAnalysis, rankCommodities } from '@/core/use-cases/calculate-rca';
import commoditiesData from '@/data/commodities.json';
import regionsData from '@/data/regions.json';
import { formatNumber, formatCurrency, formatCompactNumber } from '@/shared/utils/formatters';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { MiniChart } from '@/presentation/components/charts/productivity-trend';

const InteractiveMap = dynamic(
  () =>
    import('@/presentation/components/maps/interactive-map').then(
      (mod) => mod.InteractiveMap
    ),
  { ssr: false, loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" /> }
);

export default function DashboardPage() {
  const provinces = (regionsData as RegionData).provinces;

  const enrichedCommodities = React.useMemo(() => {
    return (commoditiesData.commodities as Commodity[]).map((c) =>
      enrichCommodityWithAnalysis(c)
    );
  }, []);

  const rankedCommodities = React.useMemo(() => {
    return rankCommodities(enrichedCommodities);
  }, [enrichedCommodities]);

  const topCommodities = rankedCommodities.filter((c) => c.rcaData.rcaScore >= 1).slice(0, 5);

  const totalProduction = enrichedCommodities.reduce((sum, c) => sum + c.data.production, 0);
  const totalEconomicValue = enrichedCommodities.reduce(
    (sum, c) => sum + c.data.economicValue,
    0
  );
  const totalArea = enrichedCommodities.reduce((sum, c) => sum + c.data.landArea, 0);

  const categoryStats = React.useMemo(() => {
    const stats = {
      pertanian: { count: 0, production: 0, icon: Wheat },
      perkebunan: { count: 0, production: 0, icon: TreePine },
      perikanan: { count: 0, production: 0, icon: Fish },
      peternakan: { count: 0, production: 0, icon: Beef },
    };

    enrichedCommodities.forEach((c) => {
      stats[c.category].count++;
      stats[c.category].production += c.data.production;
    });

    return stats;
  }, [enrichedCommodities]);

  const quickActions = [
    {
      title: 'Identifikasi Komoditas',
      description: 'Analisis RCA dan produktivitas komoditas unggulan',
      href: '/komoditas',
      icon: Map,
      color: 'bg-blue-500',
    },
    {
      title: 'Penilaian Kualitas',
      description: 'Evaluasi kualitas produk untuk retail modern',
      href: '/penilaian',
      icon: ClipboardCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Analisis Pasar',
      description: 'Surplus-defisit dan target pasar potensial',
      href: '/pasar',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Sistem Identifikasi dan Analisis Komoditas Unggulan Kawasan Transmigrasi
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Produksi
            </CardTitle>
            <Wheat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactNumber(totalProduction)} ton</div>
            <p className="text-xs text-muted-foreground mt-1">
              dari {enrichedCommodities.length} komoditas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nilai Ekonomi
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactNumber(totalEconomicValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">total nilai komoditas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Luas Lahan
            </CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactNumber(totalArea)} ha</div>
            <p className="text-xs text-muted-foreground mt-1">kawasan produktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Komoditas Unggulan
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCommodities.length}</div>
            <p className="text-xs text-muted-foreground mt-1">RCA &gt; 1.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div
                  className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}
                >
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="p-0 h-auto text-primary">
                  Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Map Preview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Peta Kawasan Transmigrasi</CardTitle>
            <CardDescription>
              Sebaran komoditas unggulan di seluruh Indonesia
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px]">
              <InteractiveMap
                provinces={provinces}
                commodities={enrichedCommodities}
              />
            </div>
          </CardContent>
        </Card>

        {/* Top Commodities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Komoditas Unggulan Tertinggi</CardTitle>
            <CardDescription>Berdasarkan skor RCA dan produktivitas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCommodities.map((commodity, index) => (
                <div
                  key={commodity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{commodity.name}</p>
                      <Badge variant="success" className="text-xs">
                        RCA: {commodity.rcaData.rcaScore.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(commodity.data.production)} ton |{' '}
                      {formatCurrency(commodity.data.economicValue)}
                    </p>
                  </div>
                  <div className="w-20 h-12">
                    <MiniChart data={commodity.historical} className="h-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/komoditas">
                <Button variant="outline" className="w-full">
                  Lihat Semua Komoditas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(categoryStats).map(([key, stat]) => {
          const Icon = stat.icon;
          const labels: Record<string, string> = {
            pertanian: 'Pertanian',
            perkebunan: 'Perkebunan',
            perikanan: 'Perikanan',
            peternakan: 'Peternakan',
          };
          return (
            <Card key={key}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{labels[key]}</p>
                    <p className="text-xl font-bold">{stat.count} komoditas</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCompactNumber(stat.production)} ton
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
