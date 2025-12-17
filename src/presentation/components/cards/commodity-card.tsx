'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

import type { CommodityWithAnalysis } from '@/core/entities/commodity';
import { getCategoryLabel, getRCAStatus } from '@/core/entities/commodity';
import { formatNumber, formatCurrency } from '@/shared/utils/formatters';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { MiniChart } from '@/presentation/components/charts/productivity-trend';

interface CommodityCardProps {
  commodity: CommodityWithAnalysis;
  onClick?: () => void;
  isSelected?: boolean;
  className?: string;
}

export function CommodityCard({
  commodity,
  onClick,
  isSelected,
  className,
}: CommodityCardProps) {
  const rcaStatus = getRCAStatus(commodity.rcaData.rcaScore);

  const getTrendIcon = () => {
    switch (commodity.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRCABadgeVariant = () => {
    switch (rcaStatus) {
      case 'unggulan':
        return 'success';
      case 'potensial':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        isSelected && 'ring-2 ring-primary',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-medium">{commodity.name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {getCategoryLabel(commodity.category)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getTrendIcon()}
          <Badge variant={getRCABadgeVariant() as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}>
            RCA: {commodity.rcaData.rcaScore.toFixed(2)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Produksi</p>
              <p className="font-semibold">{formatNumber(commodity.data.production)} ton</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nilai Ekonomi</p>
              <p className="font-semibold">{formatCurrency(commodity.data.economicValue)}</p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-1">Tren Produksi (5 tahun)</p>
            <MiniChart data={commodity.historical} className="h-[60px]" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs">
              <span className="text-muted-foreground">Produktivitas: </span>
              <span className="font-medium">
                {commodity.data.productivityRate.toFixed(2)} ton/ha
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Skor: </span>
              <span className="font-medium">{commodity.finalScore.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CommodityListItemProps {
  commodity: CommodityWithAnalysis;
  rank: number;
  onClick?: () => void;
  isSelected?: boolean;
}

export function CommodityListItem({
  commodity,
  rank,
  onClick,
  isSelected,
}: CommodityListItemProps) {
  const rcaStatus = getRCAStatus(commodity.rcaData.rcaScore);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-accent',
        isSelected && 'bg-accent'
      )}
      onClick={onClick}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{commodity.name}</p>
        <p className="text-xs text-muted-foreground">{getCategoryLabel(commodity.category)}</p>
      </div>
      <div className="text-right">
        <Badge
          variant={
            rcaStatus === 'unggulan'
              ? 'success'
              : rcaStatus === 'potensial'
                ? 'warning'
                : 'secondary'
          }
          className="text-xs"
        >
          {commodity.rcaData.rcaScore.toFixed(2)}
        </Badge>
      </div>
    </div>
  );
}
