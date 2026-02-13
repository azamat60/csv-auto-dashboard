import { parseDate, parseNumber } from "./profiler";
import type { DataRow, FilterState } from "./types";

function containsSearch(row: DataRow, term: string): boolean {
  if (!term) return true;
  const normalized = term.toLowerCase();
  return Object.values(row).some((value) => value.toLowerCase().includes(normalized));
}

export function applyFilters(rows: DataRow[], filters: FilterState): DataRow[] {
  return rows.filter((row) => {
    if (!containsSearch(row, filters.search.trim())) return false;

    if (filters.chartSelection && filters.chartSelection.values.length > 0) {
      const rowValue = row[filters.chartSelection.column] ?? "";
      if (!filters.chartSelection.values.includes(rowValue)) return false;
    }

    if (filters.categoryColumn) {
      if (filters.categoryMode === "none") return false;
      if (filters.categoryMode === "custom" && filters.categoryValues.length > 0) {
        const value = row[filters.categoryColumn] ?? "";
        if (!filters.categoryValues.includes(value)) return false;
      }
    }

    if (filters.numericColumn && filters.numericRange) {
      const parsed = parseNumber(row[filters.numericColumn] ?? "");
      if (parsed === undefined) return false;
      if (filters.numericRange.min !== undefined && parsed < filters.numericRange.min) return false;
      if (filters.numericRange.max !== undefined && parsed > filters.numericRange.max) return false;
    }

    if (filters.dateColumn && filters.dateRange) {
      const parsed = parseDate(row[filters.dateColumn] ?? "");
      if (!parsed) return false;
      if (filters.dateRange.from) {
        const from = parseDate(filters.dateRange.from);
        if (from && parsed.isBefore(from, "day")) return false;
      }
      if (filters.dateRange.to) {
        const to = parseDate(filters.dateRange.to);
        if (to && parsed.isAfter(to, "day")) return false;
      }
    }

    return true;
  });
}
