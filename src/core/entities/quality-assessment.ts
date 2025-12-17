export type QualityGrade = 'A' | 'B' | 'C';

export interface QualityThreshold {
  min: number;
  max: number;
}

export interface QualityParameter {
  id: string;
  name: string;
  unit: string;
  description: string;
  thresholds: Record<QualityGrade, QualityThreshold>;
}

export interface CommodityQualityConfig {
  name: string;
  parameters: QualityParameter[];
}

export interface ParameterResult {
  parameterId: string;
  parameterName: string;
  value: number;
  unit: string;
  grade: QualityGrade;
}

export interface QualityAssessmentResult {
  commodityType: string;
  commodityName: string;
  overallGrade: QualityGrade;
  gradeLabel: string;
  isRetailReady: boolean;
  parameterResults: ParameterResult[];
  recommendations: string[];
  assessedAt: Date;
}

export function getGradeLabel(grade: QualityGrade): string {
  const labels: Record<QualityGrade, string> = {
    A: 'Premium Quality',
    B: 'Standard Quality',
    C: 'Below Standard',
  };
  return labels[grade];
}

export function getGradeColor(grade: QualityGrade): string {
  const colors: Record<QualityGrade, string> = {
    A: 'success',
    B: 'warning',
    C: 'destructive',
  };
  return colors[grade];
}

export function isRetailReady(grade: QualityGrade): boolean {
  return grade === 'A' || grade === 'B';
}

export function determineGrade(
  value: number,
  thresholds: Record<QualityGrade, QualityThreshold>
): QualityGrade {
  if (value >= thresholds.A.min && value <= thresholds.A.max) return 'A';
  if (value >= thresholds.B.min && value <= thresholds.B.max) return 'B';
  return 'C';
}

export function calculateOverallGrade(grades: QualityGrade[]): QualityGrade {
  const gradeValues: Record<QualityGrade, number> = { A: 3, B: 2, C: 1 };
  const total = grades.reduce((sum, grade) => sum + gradeValues[grade], 0);
  const average = total / grades.length;

  if (average >= 2.5) return 'A';
  if (average >= 1.5) return 'B';
  return 'C';
}

export function generateRecommendations(
  commodityType: string,
  parameterResults: ParameterResult[]
): string[] {
  const recommendations: string[] = [];

  parameterResults.forEach((result) => {
    if (result.grade === 'C') {
      recommendations.push(getRecommendation(commodityType, result.parameterId, 'critical'));
    } else if (result.grade === 'B') {
      recommendations.push(getRecommendation(commodityType, result.parameterId, 'improve'));
    }
  });

  if (recommendations.length === 0) {
    recommendations.push('Kualitas produk sudah memenuhi standar premium. Pertahankan proses produksi saat ini.');
  }

  return recommendations;
}

function getRecommendation(
  commodityType: string,
  parameterId: string,
  level: 'critical' | 'improve'
): string {
  const recommendations: Record<string, Record<string, Record<string, string>>> = {
    padi: {
      patahan: {
        critical: 'Perbaiki proses penggilingan untuk mengurangi butir patah. Pertimbangkan upgrade mesin penggiling.',
        improve: 'Optimalkan kecepatan penggilingan untuk mengurangi patahan.',
      },
      kadarAir: {
        critical: 'Kadar air terlalu tinggi. Lakukan pengeringan ulang hingga mencapai standar maksimal 14%.',
        improve: 'Tingkatkan proses pengeringan untuk mencapai kadar air optimal.',
      },
      derajatSosoh: {
        critical: 'Derajat sosoh terlalu rendah. Perbaiki proses penyosohan beras.',
        improve: 'Tingkatkan derajat sosoh untuk mencapai standar premium.',
      },
      butirMerah: {
        critical: 'Terlalu banyak butir merah. Perbaiki proses sortasi dan grading.',
        improve: 'Lakukan sortasi lebih teliti untuk mengurangi butir merah.',
      },
    },
    jagung: {
      kadarAir: {
        critical: 'Kadar air melebihi batas. Keringkan jagung hingga di bawah 13%.',
        improve: 'Optimalkan pengeringan untuk mencapai kadar air ideal.',
      },
      butirRusak: {
        critical: 'Banyak butir rusak. Perbaiki penanganan pasca panen dan penyimpanan.',
        improve: 'Tingkatkan proses sortasi untuk mengurangi butir rusak.',
      },
      kotoran: {
        critical: 'Kotoran melebihi standar. Lakukan pembersihan lebih intensif.',
        improve: 'Tambahkan proses pembersihan untuk mengurangi kotoran.',
      },
      kadarAflatoksin: {
        critical: 'Kadar aflatoksin berbahaya! Jangan dijual untuk konsumsi. Perbaiki penyimpanan.',
        improve: 'Perbaiki kondisi penyimpanan untuk mencegah pertumbuhan jamur.',
      },
    },
    kopi: {
      defects: {
        critical: 'Nilai cacat terlalu tinggi. Perbaiki proses sortasi biji kopi.',
        improve: 'Tingkatkan ketelitian sortasi untuk mengurangi defect.',
      },
      kadarAir: {
        critical: 'Kadar air tidak optimal. Sesuaikan proses pengeringan.',
        improve: 'Fine-tune proses pengeringan untuk kadar air 10-12%.',
      },
      ukuranBiji: {
        critical: 'Ukuran biji tidak seragam. Gunakan screen untuk grading.',
        improve: 'Optimalkan proses grading untuk ukuran biji yang lebih seragam.',
      },
      warna: {
        critical: 'Keseragaman warna rendah. Perbaiki proses fermentasi dan pengeringan.',
        improve: 'Tingkatkan konsistensi proses untuk warna yang lebih seragam.',
      },
    },
  };

  return (
    recommendations[commodityType]?.[parameterId]?.[level] ||
    `Perlu perbaikan pada parameter ${parameterId}.`
  );
}
