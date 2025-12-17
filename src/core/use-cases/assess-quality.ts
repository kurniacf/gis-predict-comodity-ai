import type {
  QualityGrade,
  CommodityQualityConfig,
  ParameterResult,
  QualityAssessmentResult,
} from '../entities/quality-assessment';
import {
  determineGrade,
  calculateOverallGrade,
  getGradeLabel,
  isRetailReady,
  generateRecommendations,
} from '../entities/quality-assessment';

export interface QualityAssessmentInput {
  commodityType: string;
  parameterValues: Record<string, number>;
}

export function assessQuality(
  input: QualityAssessmentInput,
  config: CommodityQualityConfig
): QualityAssessmentResult {
  const parameterResults: ParameterResult[] = [];
  const grades: QualityGrade[] = [];

  for (const parameter of config.parameters) {
    const value = input.parameterValues[parameter.id];
    if (value === undefined) continue;

    const grade = determineGrade(value, parameter.thresholds);
    grades.push(grade);

    parameterResults.push({
      parameterId: parameter.id,
      parameterName: parameter.name,
      value,
      unit: parameter.unit,
      grade,
    });
  }

  const overallGrade = calculateOverallGrade(grades);
  const recommendations = generateRecommendations(input.commodityType, parameterResults);

  return {
    commodityType: input.commodityType,
    commodityName: config.name,
    overallGrade,
    gradeLabel: getGradeLabel(overallGrade),
    isRetailReady: isRetailReady(overallGrade),
    parameterResults,
    recommendations,
    assessedAt: new Date(),
  };
}

export function getParameterGradeDistribution(
  results: ParameterResult[]
): Record<QualityGrade, number> {
  const distribution: Record<QualityGrade, number> = { A: 0, B: 0, C: 0 };

  results.forEach((result) => {
    distribution[result.grade]++;
  });

  return distribution;
}

export function calculateQualityIndex(results: ParameterResult[]): number {
  const gradeValues: Record<QualityGrade, number> = { A: 100, B: 70, C: 40 };

  const totalScore = results.reduce((sum, result) => sum + gradeValues[result.grade], 0);
  return totalScore / results.length;
}

export function getWorstParameters(
  results: ParameterResult[],
  limit: number = 3
): ParameterResult[] {
  const gradeValues: Record<QualityGrade, number> = { A: 3, B: 2, C: 1 };

  return [...results]
    .sort((a, b) => gradeValues[a.grade] - gradeValues[b.grade])
    .slice(0, limit);
}

export function validateAssessmentInput(
  input: QualityAssessmentInput,
  config: CommodityQualityConfig
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const parameter of config.parameters) {
    const value = input.parameterValues[parameter.id];

    if (value === undefined || value === null) {
      errors.push(`${parameter.name} harus diisi.`);
      continue;
    }

    if (typeof value !== 'number' || isNaN(value)) {
      errors.push(`${parameter.name} harus berupa angka.`);
      continue;
    }

    if (value < 0) {
      errors.push(`${parameter.name} tidak boleh negatif.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
