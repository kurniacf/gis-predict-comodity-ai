'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpDown } from 'lucide-react';

import type { CommodityWithAnalysis } from '@/core/entities/commodity';
import { getCategoryLabel, getRCAStatus } from '@/core/entities/commodity';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';

interface CommodityRankingTableProps {
  commodities: CommodityWithAnalysis[];
  onRowClick?: (commodity: CommodityWithAnalysis) => void;
  sortBy?: 'rca' | 'productivity' | 'final' | 'production';
  onSortChange?: (sort: 'rca' | 'productivity' | 'final' | 'production') => void;
  className?: string;
}

export function CommodityRankingTable({
  commodities,
  onRowClick,
  sortBy: _sortBy = 'final',
  onSortChange,
  className,
}: CommodityRankingTableProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRCABadgeVariant = (status: string) => {
    switch (status) {
      case 'unggulan':
        return 'success';
      case 'potensial':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Komoditas</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-3"
                onClick={() => onSortChange?.('production')}
              >
                Produksi
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-3"
                onClick={() => onSortChange?.('rca')}
              >
                RCA
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-3"
                onClick={() => onSortChange?.('productivity')}
              >
                Produktivitas
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Nilai Ekonomi</TableHead>
            <TableHead className="text-center">Tren</TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 -ml-3"
                onClick={() => onSortChange?.('final')}
              >
                Skor
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commodities.map((commodity, index) => {
            const rcaStatus = getRCAStatus(commodity.rcaData.rcaScore);
            return (
              <TableRow
                key={commodity.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick?.(commodity)}
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="font-medium">{commodity.name}</div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {getCategoryLabel(commodity.category)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(commodity.data.production)} ton
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={getRCABadgeVariant(rcaStatus) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}
                  >
                    {commodity.rcaData.rcaScore.toFixed(2)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {commodity.data.productivityRate.toFixed(2)} ton/ha
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(commodity.data.economicValue)}
                </TableCell>
                <TableCell className="text-center">
                  {getTrendIcon(commodity.trend)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {commodity.finalScore.toFixed(1)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
