import dayjs from "dayjs";
import { histogramForColumn, parseDate, parseNumber } from "./profiler";
import type { ChartSpec, ColumnMeta, DataRow, SummarySpec } from "./types";

type InsightResult = {
  summaries: SummarySpec[];
  charts: ChartSpec[];
};

function numericColumns(metas: ColumnMeta[]): ColumnMeta[] {
  return metas.filter((meta) => meta.type === "number");
}

function dateColumns(metas: ColumnMeta[]): ColumnMeta[] {
  return metas.filter((meta) => meta.type === "date");
}

function stringColumns(metas: ColumnMeta[]): ColumnMeta[] {
  return metas.filter((meta) => meta.type === "string");
}

function booleanColumns(metas: ColumnMeta[]): ColumnMeta[] {
  return metas.filter((meta) => meta.type === "boolean");
}

function pickInterestingNumeric(metas: ColumnMeta[]): ColumnMeta | undefined {
  return numericColumns(metas)
    .slice()
    .sort((a, b) => {
      const av = (a.stats as { variance?: number } | undefined)?.variance ?? 0;
      const bv = (b.stats as { variance?: number } | undefined)?.variance ?? 0;
      return bv - av;
    })[0];
}

function buildTimeSeries(
  rows: DataRow[],
  dateCol: string,
  numericCol: string,
): Array<Record<string, string | number>> {
  const timestamps = rows
    .map((row) => parseDate(row[dateCol] ?? ""))
    .filter((value): value is dayjs.Dayjs => Boolean(value));

  if (!timestamps.length) return [];

  const min = timestamps.reduce(
    (acc, value) => (value.isBefore(acc) ? value : acc),
    timestamps[0],
  );
  const max = timestamps.reduce(
    (acc, value) => (value.isAfter(acc) ? value : acc),
    timestamps[0],
  );
  const diffDays = max.diff(min, "day");

  let granularity: "day" | "week" | "month" = "day";
  if (diffDays > 90) granularity = "week";
  if (diffDays > 365) granularity = "month";

  const buckets = new Map<string, number>();

  for (const row of rows) {
    const date = parseDate(row[dateCol] ?? "");
    const value = parseNumber(row[numericCol] ?? "");
    if (!date || value === undefined) continue;

    const key =
      granularity === "day"
        ? date.format("YYYY-MM-DD")
        : granularity === "week"
          ? date.startOf("week").format("YYYY-MM-DD")
          : date.format("YYYY-MM");

    buckets.set(key, (buckets.get(key) ?? 0) + value);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => dayjs(a[0]).valueOf() - dayjs(b[0]).valueOf())
    .map(([period, total]) => ({ period, value: Number(total.toFixed(2)) }));
}

function buildTopCategory(
  rows: DataRow[],
  categoryCol: string,
  numericCol: string,
): Array<Record<string, string | number>> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const category = (row[categoryCol] ?? "Unknown").trim() || "Unknown";
    const value = parseNumber(row[numericCol] ?? "");
    if (value === undefined) continue;
    map.set(category, (map.get(category) ?? 0) + value);
  }

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([category, total]) => ({
      category,
      value: Number(total.toFixed(2)),
    }));
}

function buildBooleanDistribution(
  rows: DataRow[],
  boolCol: string,
): Array<Record<string, string | number>> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const value = (row[boolCol] ?? "unknown").toLowerCase();
    const label = ["true", "yes", "1"].includes(value)
      ? "True"
      : ["false", "no", "0"].includes(value)
        ? "False"
        : "Unknown";
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

function buildScatter(
  rows: DataRow[],
  xCol: string,
  yCol: string,
): Array<Record<string, string | number>> {
  const points: Array<Record<string, string | number>> = [];
  for (const row of rows) {
    const x = parseNumber(row[xCol] ?? "");
    const y = parseNumber(row[yCol] ?? "");
    if (x === undefined || y === undefined) continue;
    points.push({ x, y });
    if (points.length >= 2000) break;
  }
  return points;
}

export function generateInsights(
  rows: DataRow[],
  metas: ColumnMeta[],
): InsightResult {
  const summaries: SummarySpec[] = [];
  const charts: ChartSpec[] = [];

  const numCols = numericColumns(metas);
  const dtCols = dateColumns(metas);
  const strCols = stringColumns(metas);
  const boolCols = booleanColumns(metas);

  summaries.push({
    id: "rows",
    label: "Rows",
    value: rows.length.toLocaleString(),
  });
  summaries.push({
    id: "cols",
    label: "Columns",
    value: metas.length.toLocaleString(),
  });

  const missing = metas.reduce((acc, col) => acc + col.missingCount, 0);
  summaries.push({
    id: "missing",
    label: "Missing Values",
    value: missing.toLocaleString(),
  });

  const topNumeric = pickInterestingNumeric(metas);
  if (topNumeric && topNumeric.stats && "min" in topNumeric.stats) {
    summaries.push({
      id: "variance",
      label: "Most Variable Numeric",
      value: topNumeric.key,
      hint: `${topNumeric.stats.min.toFixed(2)} / ${topNumeric.stats.mean.toFixed(2)} / ${topNumeric.stats.max.toFixed(2)}`,
    });
  }

  const topDate = dtCols[0];
  if (topDate && topDate.stats && "minDate" in topDate.stats) {
    summaries.push({
      id: "date-range",
      label: "Date Range",
      value: `${dayjs(topDate.stats.minDate).format("YYYY-MM-DD")} → ${dayjs(topDate.stats.maxDate).format("YYYY-MM-DD")}`,
    });
  }

  if (dtCols.length && numCols.length) {
    const dateCol = dtCols[0].key;
    const numCol = numCols[0].key;
    const data = buildTimeSeries(rows, dateCol, numCol);
    if (data.length) {
      charts.push({
        id: `timeseries-${dateCol}-${numCol}`,
        title: `${numCol} over time`,
        type: "timeseries",
        xKey: "period",
        yKey: "value",
        data,
      });
    }
  }

  if (strCols.length && numCols.length) {
    const categoryCol =
      strCols.find((item) => item.uniquenessRatio < 0.6)?.key ?? strCols[0].key;
    const numericCol = numCols[0].key;
    const data = buildTopCategory(rows, categoryCol, numericCol);
    if (data.length) {
      charts.push({
        id: `bar-${categoryCol}-${numericCol}`,
        title: `Top ${categoryCol} by total ${numericCol}`,
        type: "bar",
        xKey: "category",
        yKey: "value",
        data,
        interactiveFilterKey: categoryCol,
      });
    }
  }

  if (topNumeric) {
    const data = histogramForColumn(rows, topNumeric.key);
    if (data.length) {
      charts.push({
        id: `hist-${topNumeric.key}`,
        title: `${topNumeric.key} distribution`,
        type: "histogram",
        xKey: "label",
        yKey: "count",
        data,
      });
    }
  }

  if (boolCols.length) {
    const boolCol = boolCols[0].key;
    charts.push({
      id: `pie-${boolCol}`,
      title: `${boolCol} distribution`,
      type: "pie",
      xKey: "label",
      yKey: "value",
      data: buildBooleanDistribution(rows, boolCol),
      interactiveFilterKey: boolCol,
    });
  }

  if (numCols.length >= 2) {
    const [xCol, yCol] = numCols;
    const data = buildScatter(rows, xCol.key, yCol.key);
    if (data.length) {
      charts.push({
        id: `scatter-${xCol.key}-${yCol.key}`,
        title: `${xCol.key} vs ${yCol.key}`,
        type: "scatter",
        xKey: "x",
        yKey: "y",
        data,
      });
    }
  }

  return {
    summaries,
    charts: charts.slice(0, 6),
  };
}
