'use client';

import * as React from 'react';
import { History, Download, RefreshCcw } from 'lucide-react';

import type { QualityAssessmentResult, CommodityQualityConfig } from '@/core/entities/quality-assessment';
import { assessQuality } from '@/core/use-cases/assess-quality';
import qualityThresholdsData from '@/data/quality-thresholds.json';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/presentation/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { Badge } from '@/presentation/components/ui/badge';
import { QualityAssessmentForm } from '@/presentation/components/forms/quality-assessment-form';
import { QualityResultCard, GradeIndicator } from '@/presentation/components/cards/quality-result-card';
import { InsightList } from '@/presentation/components/cards/insight-card';
import { formatDateTime } from '@/shared/utils/formatters';

export default function PenilaianPage() {
  const [result, setResult] = React.useState<QualityAssessmentResult | null>(null);
  const [history, setHistory] = React.useState<QualityAssessmentResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const qualityConfigs = qualityThresholdsData as Record<string, CommodityQualityConfig>;

  const handleAssessment = (commodityType: string, values: Record<string, number>) => {
    setIsLoading(true);

    setTimeout(() => {
      const config = qualityConfigs[commodityType];
      if (config) {
        const assessmentResult = assessQuality(
          { commodityType, parameterValues: values },
          config
        );
        setResult(assessmentResult);
        setHistory((prev) => [assessmentResult, ...prev].slice(0, 10));
      }
      setIsLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setResult(null);
  };

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'success';
      case 'B':
        return 'warning';
      default:
        return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Penilaian Kualitas Komoditas</h1>
        <p className="text-muted-foreground">
          Evaluasi kualitas komoditas untuk kelayakan retail modern
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assessment Form */}
        <div className="space-y-6">
          <QualityAssessmentForm
            commodityConfigs={qualityConfigs}
            onSubmit={handleAssessment}
            isLoading={isLoading}
          />

          {/* Quick Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Panduan Singkat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <GradeIndicator grade="A" size="sm" />
                <div>
                  <p className="font-medium text-sm">Grade A - Premium</p>
                  <p className="text-xs text-muted-foreground">
                    Layak untuk retail modern dan ekspor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GradeIndicator grade="B" size="sm" />
                <div>
                  <p className="font-medium text-sm">Grade B - Standar</p>
                  <p className="text-xs text-muted-foreground">
                    Layak untuk retail modern dengan catatan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <GradeIndicator grade="C" size="sm" />
                <div>
                  <p className="font-medium text-sm">Grade C - Rendah</p>
                  <p className="text-xs text-muted-foreground">
                    Perlu perbaikan sebelum dijual
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Result Section */}
        <div className="space-y-6">
          {result ? (
            <>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Penilaian Baru
                </Button>
              </div>
              <QualityResultCard result={result} />
            </>
          ) : (
            <Card className="h-[400px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p className="text-lg mb-2">Belum Ada Hasil</p>
                <p className="text-sm">
                  Pilih komoditas dan masukkan parameter untuk memulai penilaian
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* History & Insights Tabs */}
      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Riwayat Penilaian
          </TabsTrigger>
          <TabsTrigger value="insights">Insight & Rekomendasi</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Riwayat Penilaian</CardTitle>
              {history.length > 0 && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Komoditas</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Retail Ready</TableHead>
                      <TableHead>Parameter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm">
                          {formatDateTime(item.assessedAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.commodityName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={getGradeBadgeVariant(item.overallGrade) as 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'}
                          >
                            Grade {item.overallGrade}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={item.isRetailReady ? 'success' : 'destructive'}
                          >
                            {item.isRetailReady ? 'Ya' : 'Tidak'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {item.parameterResults
                            .map((p) => `${p.parameterName}: ${p.grade}`)
                            .join(', ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Belum ada riwayat penilaian
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          {result ? (
            <InsightList
              insights={result.recommendations}
              type={result.overallGrade === 'A' ? 'success' : result.overallGrade === 'B' ? 'warning' : 'tip'}
            />
          ) : (
            <Card className="py-12">
              <CardContent className="text-center text-muted-foreground">
                Lakukan penilaian untuk mendapatkan insight dan rekomendasi
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
