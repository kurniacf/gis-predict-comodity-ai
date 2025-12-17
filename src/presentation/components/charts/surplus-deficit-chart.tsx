'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

import type { RegionSurplusDeficit } from '@/core/entities/market-analysis';
import { formatNumber } from '@/shared/utils/formatters';

interface SurplusDeficitChartProps {
  data: RegionSurplusDeficit[];
  className?: string;
}

export function SurplusDeficitChart({ data, className }: SurplusDeficitChartProps) {
  const chartData = data.slice(0, 10).map((region) => ({
    name: region.regionName,
    surplus: region.surplus,
    status: region.status,
  }));

  const getBarColor = (status: string): string => {
    if (status === 'surplus') return 'hsl(var(--success))';
    if (status === 'deficit') return 'hsl(var(--destructive))';
    return 'hsl(var(--warning))';
  };

  return (
    <div className={className} style={{ minWidth: 300, minHeight: 350 }}>
      <ResponsiveContainer width="100%" height={350} minWidth={300} minHeight={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="name"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => formatNumber(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [
              `${formatNumber(value)} ton`,
              value >= 0 ? 'Surplus' : 'Defisit',
            ]}
          />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
          <Bar dataKey="surplus" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SurplusDeficitSummaryChart({
  surplusCount,
  deficitCount,
  balancedCount,
  className,
}: {
  surplusCount: number;
  deficitCount: number;
  balancedCount: number;
  className?: string;
}) {
  const data = [
    { name: 'Surplus', value: surplusCount, color: 'hsl(var(--success))' },
    { name: 'Defisit', value: deficitCount, color: 'hsl(var(--destructive))' },
    { name: 'Seimbang', value: balancedCount, color: 'hsl(var(--warning))' },
  ];

  return (
    <div className={className} style={{ minWidth: 200, minHeight: 200 }}>
      <ResponsiveContainer width="100%" height={200} minWidth={200} minHeight={200}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
          <XAxis type="number" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis
            dataKey="name"
            type="category"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            width={70}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value} wilayah`, 'Jumlah']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
