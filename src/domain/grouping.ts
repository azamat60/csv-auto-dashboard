import dayjs from "dayjs";
import { aggregate } from "./aggregations";
import { parseNumber } from "./profiler";
import type { AggType, DataRow } from "./types";

export function groupRows(
  rows: DataRow[],
  groupByCol: string,
  metricCol: string | undefined,
  agg: AggType,
): Array<{ label: string; value: number }> {
  if (!groupByCol) return [];

  const map = new Map<string, number[]>();

  for (const row of rows) {
    const key = row[groupByCol] ?? "Unknown";
    if (!map.has(key)) map.set(key, []);
    const bucket = map.get(key)!;

    if (agg === "count") {
      bucket.push(1);
      continue;
    }

    if (!metricCol) continue;
    const parsed = parseNumber(row[metricCol] ?? "");
    if (parsed !== undefined) bucket.push(parsed);
  }

  const series = Array.from(map.entries()).map(([label, values]) => ({
    label,
    value: aggregate(values, agg),
  }));

  const isDateLike = series.every((item) => dayjs(item.label).isValid());
  if (isDateLike) {
    return series.sort((a, b) => dayjs(a.label).valueOf() - dayjs(b.label).valueOf());
  }

  return series.sort((a, b) => b.value - a.value);
}
