'use client';

import * as React from 'react';

import type { MarketTarget } from '@/core/entities/market-analysis';
import { formatNumber } from '@/shared/utils/formatters';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';

interface MarketTargetTableProps {
  targets: MarketTarget[];
  onRowClick?: (target: MarketTarget) => void;
  className?: string;
}

export function MarketTargetTable({
  targets,
  onRowClick,
  className,
}: MarketTargetTableProps) {
  const getFeasibilityBadge = (feasibility: string) => {
    switch (feasibility) {
      case 'high':
        return <Badge variant="success">Tinggi</Badge>;
      case 'medium':
        return <Badge variant="warning">Sedang</Badge>;
      default:
        return <Badge variant="secondary">Rendah</Badge>;
    }
  };

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Rank</TableHead>
            <TableHead>Wilayah</TableHead>
            <TableHead>Provinsi</TableHead>
            <TableHead className="text-right">Defisit</TableHead>
            <TableHead className="text-right">Est. Kebutuhan</TableHead>
            <TableHead className="text-right">Jarak</TableHead>
            <TableHead className="text-center">Kelayakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {targets.map((target) => (
            <TableRow
              key={target.regionId}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick?.(target)}
            >
              <TableCell className="font-medium">{target.rank}</TableCell>
              <TableCell>
                <div className="font-medium">{target.regionName}</div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {target.province}
              </TableCell>
              <TableCell className="text-right text-destructive">
                {formatNumber(Math.abs(target.deficitAmount))} ton
              </TableCell>
              <TableCell className="text-right">
                {formatNumber(target.estimatedDemand)} ton
              </TableCell>
              <TableCell className="text-right">
                {target.distance ? `${formatNumber(target.distance)} km` : '-'}
              </TableCell>
              <TableCell className="text-center">
                {getFeasibilityBadge(target.feasibility)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
