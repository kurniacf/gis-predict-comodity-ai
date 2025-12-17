export function formatNumber(num: number, locale: string = 'id-ID'): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatCurrency(
  amount: number,
  currency: string = 'IDR',
  locale: string = 'id-ID'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactNumber(num: number, locale: string = 'id-ID'): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)} M`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)} Jt`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)} Rb`;
  }
  return formatNumber(num, locale);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatWeight(tons: number): string {
  if (tons >= 1000) {
    return `${formatNumber(tons / 1000)} ribu ton`;
  }
  return `${formatNumber(tons)} ton`;
}

export function formatArea(hectares: number): string {
  if (hectares >= 1000) {
    return `${formatNumber(hectares / 1000)} ribu ha`;
  }
  return `${formatNumber(hectares)} ha`;
}

export function formatDate(date: Date, locale: string = 'id-ID'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatDateTime(date: Date, locale: string = 'id-ID'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRCAScore(score: number): string {
  return score.toFixed(2);
}

export function formatProductivity(rate: number, unit: string = 'ton/ha'): string {
  return `${rate.toFixed(2)} ${unit}`;
}
