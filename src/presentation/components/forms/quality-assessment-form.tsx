'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

import type { CommodityQualityConfig } from '@/core/entities/quality-assessment';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';

interface QualityAssessmentFormProps {
  commodityConfigs: Record<string, CommodityQualityConfig>;
  onSubmit: (commodityType: string, values: Record<string, number>) => void;
  isLoading?: boolean;
  className?: string;
}

export function QualityAssessmentForm({
  commodityConfigs,
  onSubmit,
  isLoading,
  className,
}: QualityAssessmentFormProps) {
  const [selectedCommodity, setSelectedCommodity] = React.useState<string>('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const selectedConfig = selectedCommodity ? commodityConfigs[selectedCommodity] : null;

  const handleCommodityChange = (value: string) => {
    setSelectedCommodity(value);
    reset();
  };

  const onFormSubmit = (data: Record<string, string>) => {
    const numericValues: Record<string, number> = {};
    Object.entries(data).forEach(([key, value]) => {
      numericValues[key] = parseFloat(value);
    });
    onSubmit(selectedCommodity, numericValues);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Penilaian Kualitas Komoditas</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Commodity Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="commodityType">Jenis Komoditas</Label>
            <Select value={selectedCommodity} onValueChange={handleCommodityChange}>
              <SelectTrigger id="commodityType">
                <SelectValue placeholder="Pilih jenis komoditas" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(commodityConfigs).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Parameters */}
          {selectedConfig && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium text-sm text-muted-foreground">
                Parameter Kualitas {selectedConfig.name}
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedConfig.parameters.map((param) => (
                  <div key={param.id} className="space-y-2">
                    <Label htmlFor={param.id}>
                      {param.name} ({param.unit})
                    </Label>
                    <Input
                      id={param.id}
                      type="number"
                      step="0.01"
                      placeholder={`Masukkan ${param.name.toLowerCase()}`}
                      {...register(param.id, {
                        required: `${param.name} wajib diisi`,
                        min: { value: 0, message: 'Nilai tidak boleh negatif' },
                      })}
                    />
                    <p className="text-xs text-muted-foreground">{param.description}</p>
                    {errors[param.id] && (
                      <p className="text-xs text-destructive">
                        {errors[param.id]?.message as string}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Threshold Reference */}
          {selectedConfig && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-sm text-muted-foreground mb-3">
                Standar Kualitas
              </h4>
              <div className="grid gap-2 text-xs">
                {selectedConfig.parameters.map((param) => (
                  <div key={param.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span>{param.name}</span>
                    <div className="flex gap-2">
                      <span className="text-green-600">
                        A: {param.thresholds.A.min}-{param.thresholds.A.max}
                      </span>
                      <span className="text-amber-600">
                        B: {param.thresholds.B.min}-{param.thresholds.B.max}
                      </span>
                      <span className="text-red-600">
                        C: {param.thresholds.C.min}+
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!selectedCommodity || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Nilai Kualitas
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
