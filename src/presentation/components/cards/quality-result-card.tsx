'use client';

import * as React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';

import type { QualityAssessmentResult, QualityGrade } from '@/core/entities/quality-assessment';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/presentation/components/ui/card';
import { Badge } from '@/presentation/components/ui/badge';
import { Separator } from '@/presentation/components/ui/separator';

interface QualityResultCardProps {
  result: QualityAssessmentResult;
  className?: string;
}

export function QualityResultCard({ result, className }: QualityResultCardProps) {
  const getGradeStyles = (grade: QualityGrade) => {
    switch (grade) {
      case 'A':
        return {
          bg: 'from-green-50 to-green-100',
          text: 'text-green-600',
          border: 'border-green-200',
        };
      case 'B':
        return {
          bg: 'from-amber-50 to-amber-100',
          text: 'text-amber-600',
          border: 'border-amber-200',
        };
      case 'C':
        return {
          bg: 'from-red-50 to-red-100',
          text: 'text-red-600',
          border: 'border-red-200',
        };
    }
  };

  const styles = getGradeStyles(result.overallGrade);

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Grade Header */}
      <div className={cn('bg-gradient-to-br p-8 text-center', styles.bg)}>
        <div className={cn('text-7xl font-bold mb-2', styles.text)}>
          {result.overallGrade}
        </div>
        <div className={cn('text-lg font-medium', styles.text)}>
          {result.gradeLabel}
        </div>
        <Badge
          variant={result.isRetailReady ? 'success' : 'destructive'}
          className="mt-4"
        >
          {result.isRetailReady ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Layak Retail Modern
            </>
          ) : (
            <>
              <X className="h-3 w-3 mr-1" />
              Tidak Layak Retail Modern
            </>
          )}
        </Badge>
      </div>

      <CardContent className="p-6">
        {/* Parameter Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Hasil per Parameter</h4>
          <div className="space-y-3">
            {result.parameterResults.map((param) => (
              <div
                key={param.parameterId}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{param.parameterName}</p>
                  <p className="text-xs text-muted-foreground">
                    {param.value} {param.unit}
                  </p>
                </div>
                <Badge
                  variant={
                    param.grade === 'A'
                      ? 'success'
                      : param.grade === 'B'
                        ? 'warning'
                        : 'destructive'
                  }
                >
                  Grade {param.grade}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Recommendations */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Rekomendasi
          </h4>
          <ul className="space-y-2">
            {result.recommendations.map((rec, index) => (
              <li
                key={index}
                className="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span className="text-primary">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface GradeIndicatorProps {
  grade: QualityGrade;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GradeIndicator({ grade, size = 'md', className }: GradeIndicatorProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-4xl',
  };

  const colorClasses = {
    A: 'bg-green-100 text-green-600 border-green-200',
    B: 'bg-amber-100 text-amber-600 border-amber-200',
    C: 'bg-red-100 text-red-600 border-red-200',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold border-2',
        sizeClasses[size],
        colorClasses[grade],
        className
      )}
    >
      {grade}
    </div>
  );
}
