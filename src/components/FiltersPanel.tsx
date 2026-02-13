import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Hash,
  LayoutGrid,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { FilterState, GroupingConfig } from "../domain/types";

type FiltersPanelProps = {
  filters: FilterState;
  grouping: GroupingConfig;
  dateColumns: string[];
  stringColumns: string[];
  numericColumns: string[];
  categoryValues: string[];
  onPatchFilters: (patch: Partial<FilterState>) => void;
  onGrouping: (patch: Partial<GroupingConfig>) => void;
  onReset: () => void;
};

export function FiltersPanel({
  filters,
  grouping,
  dateColumns,
  stringColumns,
  numericColumns,
  categoryValues,
  onPatchFilters,
  onGrouping,
  onReset,
}: FiltersPanelProps) {
  const [search, setSearch] = useState(filters.search);
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onPatchFilters({ search });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, onPatchFilters]);

  useEffect(() => {
    setSearch(filters.search);
  }, [filters.search]);

  const categoryOptions = useMemo(
    () => categoryValues.slice(0, 60),
    [categoryValues],
  );

  const selectedCategoryValues = useMemo(() => {
    if (!filters.categoryColumn) return [];
    if ((filters.categoryMode ?? "all") === "none") return [];
    if ((filters.categoryMode ?? "all") === "all") return categoryOptions;
    const available = new Set(categoryOptions);
    return filters.categoryValues.filter((value) => available.has(value));
  }, [
    categoryOptions,
    filters.categoryColumn,
    filters.categoryMode,
    filters.categoryValues,
  ]);

  const allCategorySelected =
    categoryOptions.length === 0 ||
    (filters.categoryMode ?? "all") === "all";
  const noneCategorySelected = (filters.categoryMode ?? "all") === "none";
  const partialCategorySelection =
    selectedCategoryValues.length > 0 &&
    selectedCategoryValues.length < categoryOptions.length;

  useEffect(() => {
    if (!selectAllRef.current) return;
    selectAllRef.current.indeterminate = partialCategorySelection;
  }, [partialCategorySelection]);

  const updateCategoryValues = (nextValues: string[]) => {
    if (nextValues.length === 0) {
      onPatchFilters({ categoryMode: "none", categoryValues: [] });
      return;
    }
    if (nextValues.length === categoryOptions.length) {
      onPatchFilters({ categoryMode: "all", categoryValues: [] });
      return;
    }
    onPatchFilters({ categoryMode: "custom", categoryValues: nextValues });
  };

  const toggleCategoryValue = (value: string) => {
    if (allCategorySelected) {
      updateCategoryValues(categoryOptions.filter((item) => item !== value));
      return;
    }
    if (noneCategorySelected) {
      updateCategoryValues([value]);
      return;
    }

    const next = new Set(selectedCategoryValues);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    updateCategoryValues(Array.from(next));
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <SlidersHorizontal
            size={16}
            className="text-emerald-600 dark:text-emerald-400"
          />
          Control Panel
        </h3>
        <button
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          type="button"
          onClick={onReset}
        >
          <RotateCcw size={13} />
          Reset filters
        </button>
      </div>

      <div className="space-y-6 p-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-emerald-500"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search across all data..."
          />
        </div>

        <div className="grid gap-6">
          {/* Time & Categories */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Calendar size={14} /> Dimensions
            </h4>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Date Column
                  </span>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      value={filters.dateColumn ?? ""}
                      onChange={(event) =>
                        onPatchFilters({
                          dateColumn: event.target.value || undefined,
                        })
                      }
                    >
                      <option value="">None</option>
                      {dateColumns.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Category
                  </span>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      value={filters.categoryColumn ?? ""}
                      onChange={(event) =>
                        onPatchFilters({
                          categoryColumn: event.target.value || undefined,
                          categoryMode: "all",
                          categoryValues: [],
                        })
                      }
                    >
                      <option value="">None</option>
                      {stringColumns.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </label>
              </div>

              {filters.dateColumn && (
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/50 dark:bg-slate-900/50">
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-500">
                      From
                    </span>
                    <input
                      type="date"
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                      value={filters.dateRange?.from ?? ""}
                      onChange={(e) =>
                        onPatchFilters({
                          dateRange: {
                            ...filters.dateRange,
                            from: e.target.value || undefined,
                          },
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-500">
                      To
                    </span>
                    <input
                      type="date"
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                      value={filters.dateRange?.to ?? ""}
                      onChange={(e) =>
                        onPatchFilters({
                          dateRange: {
                            ...filters.dateRange,
                            to: e.target.value || undefined,
                          },
                        })
                      }
                    />
                  </label>
                </div>
              )}

              {filters.categoryColumn && (
                <div className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Filter Values
                  </span>
                  <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/70">
                    <label className="flex cursor-pointer items-center gap-2 border-b border-slate-100 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        checked={allCategorySelected}
                        onChange={() => {
                          if (allCategorySelected) {
                            onPatchFilters({
                              categoryMode: "none",
                              categoryValues: [],
                            });
                            return;
                          }
                          onPatchFilters({
                            categoryMode: "all",
                            categoryValues: [],
                          });
                        }}
                      />
                      Select all
                    </label>

                    <div className="max-h-44 space-y-1 overflow-y-auto p-2">
                      {categoryOptions.map((value) => (
                        <label
                          key={value}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            checked={
                              allCategorySelected || selectedCategoryValues.includes(value)
                            }
                            onChange={() => toggleCategoryValue(value)}
                          />
                          <span className="truncate">{value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metrics & Grouping */}
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Hash size={14} /> Metrics & Analysis
            </h4>

            <div className="grid gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Numeric Column
                </span>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    value={filters.numericColumn ?? ""}
                    onChange={(e) =>
                      onPatchFilters({
                        numericColumn: e.target.value || undefined,
                      })
                    }
                  >
                    <option value="">None</option>
                    {numericColumns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </label>

              {filters.numericColumn && (
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/50 dark:bg-slate-900/50">
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-500">
                      Min
                    </span>
                    <input
                      type="number"
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                      value={filters.numericRange?.min ?? ""}
                      onChange={(e) =>
                        onPatchFilters({
                          numericRange: {
                            ...filters.numericRange,
                            min: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          },
                        })
                      }
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-500">
                      Max
                    </span>
                    <input
                      type="number"
                      className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                      value={filters.numericRange?.max ?? ""}
                      onChange={(e) =>
                        onPatchFilters({
                          numericRange: {
                            ...filters.numericRange,
                            max: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          },
                        })
                      }
                    />
                  </label>
                </div>
              )}

              <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <span className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-900 dark:text-white">
                  <LayoutGrid size={12} /> Group By
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800"
                      value={grouping.groupBy ?? ""}
                      onChange={(e) =>
                        onGrouping({ groupBy: e.target.value || undefined })
                      }
                    >
                      <option value="">None</option>
                      {[...stringColumns, ...dateColumns].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full appearance-none rounded border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800"
                      value={grouping.aggregation}
                      onChange={(e) =>
                        onGrouping({
                          aggregation: e.target
                            .value as GroupingConfig["aggregation"],
                        })
                      }
                    >
                      <option value="sum">Sum</option>
                      <option value="avg">Avg</option>
                      <option value="count">Count</option>
                      <option value="min">Min</option>
                      <option value="max">Max</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
