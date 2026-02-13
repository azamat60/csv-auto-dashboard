import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { histogram, mean, median, quantile, variance } from "./aggregations";
import type { ColumnMeta, ColumnType, DataRow } from "./types";

dayjs.extend(customParseFormat);

const missingSet = new Set(["", "null", "n/a", "na", "-"]);
const trueSet = new Set(["true", "yes", "1"]);
const falseSet = new Set(["false", "no", "0"]);
const dateFormats = ["YYYY-MM-DD", "YYYY/MM/DD", "DD.MM.YYYY", "MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD HH:mm:ss"];

export function isMissing(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  return missingSet.has(String(value).trim().toLowerCase());
}

export function parseNumber(value: string): number | undefined {
  const raw = value.trim();
  if (!raw) return undefined;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");

  if (hasComma && hasDot) {
    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    const normalized = lastDot > lastComma ? raw.replace(/,/g, "") : raw.replace(/\./g, "").replace(/,/g, ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (hasComma && !hasDot) {
    const normalized = raw.replace(/,/g, ".");
    if (!/^-?\d+(\.\d+)?$/.test(normalized)) return undefined;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  const normalized = raw.replace(/,/g, "");
  if (/^-?\d+(\.\d+)?$/.test(normalized)) {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function parseDate(value: string): dayjs.Dayjs | undefined {
  const raw = value.trim();
  if (!raw) return undefined;

  const direct = dayjs(raw);
  if (direct.isValid()) return direct;

  for (const format of dateFormats) {
    const candidate = dayjs(raw, format, true);
    if (candidate.isValid()) return candidate;
  }

  return undefined;
}

function detectType(values: string[], uniquenessRatio: number): ColumnType {
  const nonMissing = values.filter((value) => !isMissing(value));
  if (!nonMissing.length) return "string";

  const numberHits = nonMissing.filter((value) => parseNumber(value) !== undefined).length;
  const dateHits = nonMissing.filter((value) => parseDate(value) !== undefined).length;
  const boolHits = nonMissing.filter((value) => {
    const normalized = value.trim().toLowerCase();
    return trueSet.has(normalized) || falseSet.has(normalized);
  }).length;

  if (boolHits / nonMissing.length > 0.95) return "boolean";
  if (numberHits / nonMissing.length > 0.85) {
    if (uniquenessRatio > 0.98 && nonMissing.length > 20 && /id|uuid|code|key/i.test(nonMissing[0]) === false) {
      return "id-like";
    }
    return "number";
  }
  if (dateHits / nonMissing.length > 0.75) return "date";
  if (uniquenessRatio > 0.98 && nonMissing.length > 20) return "id-like";
  return "string";
}

export function profileDataset(rows: DataRow[], headers: string[]): ColumnMeta[] {
  return headers.map((key) => {
    const values = rows.map((row) => row[key] ?? "");
    const missingCount = values.filter((value) => isMissing(value)).length;
    const nonMissing = values.filter((value) => !isMissing(value));
    const uniqueCount = new Set(nonMissing).size;
    const uniquenessRatio = uniqueCount / Math.max(1, nonMissing.length);
    const type = detectType(values, uniquenessRatio);

    if (type === "number") {
      const numbers = nonMissing.map((value) => parseNumber(value)).filter((value): value is number => value !== undefined);
      const sorted = [...numbers].sort((a, b) => a - b);
      return {
        key,
        originalName: key,
        type,
        missingCount,
        uniquenessRatio,
        stats: {
          min: sorted[0] ?? 0,
          max: sorted[sorted.length - 1] ?? 0,
          mean: mean(numbers),
          median: median(numbers),
          p95: quantile(sorted, 0.95),
          variance: variance(numbers),
          missingCount,
        },
      } satisfies ColumnMeta;
    }

    if (type === "date") {
      const parsed = nonMissing.map((value) => parseDate(value)).filter((value): value is dayjs.Dayjs => Boolean(value));
      const sorted = parsed.sort((a, b) => a.valueOf() - b.valueOf());
      return {
        key,
        originalName: key,
        type,
        missingCount,
        uniquenessRatio,
        stats: {
          minDate: sorted[0]?.toISOString() ?? "",
          maxDate: sorted[sorted.length - 1]?.toISOString() ?? "",
          missingCount,
          parseSuccessRate: parsed.length / Math.max(1, nonMissing.length),
        },
      } satisfies ColumnMeta;
    }

    if (type === "boolean") {
      const counts = nonMissing.reduce(
        (acc, value) => {
          const normalized = value.trim().toLowerCase();
          if (trueSet.has(normalized)) acc.trueCount += 1;
          if (falseSet.has(normalized)) acc.falseCount += 1;
          return acc;
        },
        { trueCount: 0, falseCount: 0 },
      );

      return {
        key,
        originalName: key,
        type,
        missingCount,
        uniquenessRatio,
        stats: {
          ...counts,
          missingCount,
        },
      } satisfies ColumnMeta;
    }

    const topValues = Array.from(
      nonMissing.reduce((acc, value) => {
        acc.set(value, (acc.get(value) ?? 0) + 1);
        return acc;
      }, new Map<string, number>()),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }));

    return {
      key,
      originalName: key,
      type,
      missingCount,
      uniquenessRatio,
      stats: {
        uniqueCount,
        topValues,
        missingCount,
      },
    } satisfies ColumnMeta;
  }).map((meta) => ({
    ...meta,
    uniquenessRatio: Number((meta.uniquenessRatio * 100).toFixed(2)) / 100,
  }));
}

export function histogramForColumn(rows: DataRow[], key: string): Array<{ label: string; count: number; min: number; max: number }> {
  const values = rows.map((row) => parseNumber(row[key] ?? "")).filter((value): value is number => value !== undefined);
  return histogram(values, 12).map((item) => ({
    label: `${item.binStart.toFixed(1)} - ${item.binEnd.toFixed(1)}`,
    count: item.count,
    min: item.binStart,
    max: item.binEnd,
  }));
}
