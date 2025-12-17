'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import type { HistoricalData } from '@/core/entities/commodity';
import { formatNumber } from '@/shared/utils/formatters';

interface ProductivityTrendProps {
  data: HistoricalData[];
  commodityName: string;
  className?: string;
}

export function ProductivityTrend({ data, className }: ProductivityTrendProps) {
  const chartData = data.map((item) => ({
    year: item.year.toString(),
    produksi: item.production,
    lahan: item.landArea,
    produktivitas: item.landArea > 0 ? item.production / item.landArea : 0,
  }));

  return (
    <div className={className} style={{ minWidth: 300, minHeight: 300 }}>
      <ResponsiveContainer width="100%" height={300} minWidth={300} minHeight={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="year"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            yAxisId="left"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `${value.toFixed(1)} t/ha`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'produksi') return [formatNumber(value) + ' ton', 'Produksi'];
              if (name === 'lahan') return [formatNumber(value) + ' ha', 'Luas Lahan'];
              if (name === 'produktivitas')
                return [value.toFixed(2) + ' ton/ha', 'Produktivitas'];
              return [value, name];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="produksi"
            name="Produksi (ton)"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))' }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="produktivitas"
            name="Produktivitas (ton/ha)"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--success))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MiniChartProps {
  data: HistoricalData[];
  className?: string;
}

export function MiniChart({ data, className }: MiniChartProps) {
  const chartData = data.slice(-5).map((item) => ({
    year: item.year.toString(),
    value: item.production,
  }));

  return (
    <div className={className} style={{ minWidth: 60, minHeight: 40 }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={60} minHeight={40}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
