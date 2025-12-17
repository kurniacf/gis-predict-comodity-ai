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

import type { CommodityWithAnalysis } from '@/core/entities/commodity';

interface RCAComparisonProps {
  commodities: CommodityWithAnalysis[];
  className?: string;
}

export function RCAComparison({ commodities, className }: RCAComparisonProps) {
  const chartData = commodities.slice(0, 10).map((commodity) => ({
    name: commodity.name,
    rca: commodity.rcaData.rcaScore,
    category: commodity.category,
  }));

  const getBarColor = (rca: number): string => {
    if (rca >= 1.5) return 'hsl(var(--success))';
    if (rca >= 1) return 'hsl(142.1 70.6% 45.3%)';
    if (rca >= 0.5) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className={className} style={{ minWidth: 300, minHeight: 350 }}>
      <ResponsiveContainer width="100%" height={350} minWidth={300} minHeight={350}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
          <XAxis
            type="number"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            domain={[0, 'auto']}
          />
          <YAxis
            dataKey="name"
            type="category"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            width={80}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [value.toFixed(2), 'RCA Score']}
          />
          <ReferenceLine x={1} stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" label={{ value: 'RCA = 1', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
          <Bar dataKey="rca" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.rca)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
