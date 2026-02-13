import type { AggType } from "./types";

export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1] ?? sorted[base];
  return sorted[base] + rest * (next - sorted[base]);
}

export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

export function variance(values: number[]): number {
  if (!values.length) return 0;
  const avg = mean(values);
  return values.reduce((acc, value) => acc + (value - avg) ** 2, 0) / values.length;
}

export function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return quantile(sorted, 0.5);
}

export function aggregate(values: number[], agg: AggType): number {
  if (agg === "count") return values.length;
  if (!values.length) return 0;

  switch (agg) {
    case "sum":
      return values.reduce((acc, value) => acc + value, 0);
    case "avg":
      return mean(values);
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    default:
      return 0;
  }
}

export function histogram(values: number[], bins = 12): Array<{ binStart: number; binEnd: number; count: number }> {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ binStart: min, binEnd: max, count: values.length }];
  }

  const size = (max - min) / bins;
  const result = Array.from({ length: bins }, (_, index) => ({
    binStart: min + index * size,
    binEnd: index === bins - 1 ? max : min + (index + 1) * size,
    count: 0,
  }));

  for (const value of values) {
    const rawIndex = Math.floor((value - min) / size);
    const safeIndex = Math.min(result.length - 1, Math.max(0, rawIndex));
    result[safeIndex].count += 1;
  }

  return result;
}
