'use client';

import * as React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, Info } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/presentation/components/ui/card';

type InsightType = 'success' | 'warning' | 'info' | 'tip';

interface InsightCardProps {
  type: InsightType;
  title: string;
  description: string;
  className?: string;
}

export function InsightCard({ type, title, description, className }: InsightCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'tip':
        return <Lightbulb className="h-5 w-5 text-purple-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'tip':
        return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <Card className={cn('border', getBackgroundColor(), className)}>
      <CardContent className="flex gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface InsightListProps {
  insights: string[];
  type?: InsightType;
  className?: string;
}

export function InsightList({ insights, type = 'info', className }: InsightListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {insights.map((insight, index) => (
        <InsightCard
          key={index}
          type={type}
          title={`Insight ${index + 1}`}
          description={insight}
        />
      ))}
    </div>
  );
}
