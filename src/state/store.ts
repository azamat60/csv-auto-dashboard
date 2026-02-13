import { create } from "zustand";
import { applyFilters } from "../domain/filters";
import { groupRows } from "../domain/grouping";
import { generateInsights } from "../domain/insightEngine";
import { profileDataset } from "../domain/profiler";
import type { ChartSpec, ColumnMeta, DataRow, FilterState, GroupingConfig, SummarySpec, ViewConfig } from "../domain/types";
import { clearDataset, loadDataset, loadViews, saveDataset, saveViews } from "../storage/localStorage";

type AppState = {
  datasetName: string;
  headers: string[];
  rows: DataRow[];
  metas: ColumnMeta[];
  loadingProgress: number;
  error?: string;
  filters: FilterState;
  grouping: GroupingConfig;
  views: ViewConfig[];
  activeViewId: string;
  summaries: SummarySpec[];
  charts: ChartSpec[];
  mainChart?: ChartSpec;
  filteredRows: DataRow[];
  initialize: () => void;
  setDataset: (name: string, headers: string[], rows: DataRow[]) => void;
  setLoadingProgress: (progress: number) => void;
  setError: (error?: string) => void;
  patchFilters: (patch: Partial<FilterState>) => void;
  resetFilters: () => void;
  setGrouping: (patch: Partial<GroupingConfig>) => void;
  clearDataset: () => void;
  saveCurrentView: (name: string) => void;
  applyView: (id: string) => void;
  deleteView: (id: string) => void;
  importViews: (views: ViewConfig[]) => void;
};

const defaultFilters: FilterState = {
  search: "",
  categoryMode: "all",
  categoryValues: [],
};

const defaultGrouping: GroupingConfig = {
  aggregation: "sum",
};

function normalizeFilters(filters: FilterState): FilterState {
  if (filters.categoryMode) return filters;
  return {
    ...filters,
    categoryMode: filters.categoryValues.length > 0 ? "custom" : "all",
  };
}

function recompute(state: Pick<AppState, "rows" | "metas" | "filters" | "grouping">): Pick<AppState, "filteredRows" | "summaries" | "charts" | "mainChart"> {
  const filteredRows = applyFilters(state.rows, state.filters);
  const insights = generateInsights(filteredRows, state.metas);

  let mainChart: ChartSpec | undefined;
  if (state.grouping.groupBy) {
    const data = groupRows(filteredRows, state.grouping.groupBy, state.grouping.metric, state.grouping.aggregation).map((item) => ({
      group: item.label,
      value: item.value,
    }));

    if (data.length) {
      mainChart = {
        id: "group-main",
        title: `Grouped by ${state.grouping.groupBy} (${state.grouping.aggregation})`,
        type: "bar",
        xKey: "group",
        yKey: "value",
        data,
      };
    }
  }

  return {
    filteredRows,
    summaries: insights.summaries,
    charts: insights.charts,
    mainChart,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  datasetName: "",
  headers: [],
  rows: [],
  metas: [],
  loadingProgress: 0,
  filters: defaultFilters,
  grouping: defaultGrouping,
  views: [],
  activeViewId: "default",
  summaries: [],
  charts: [],
  filteredRows: [],

  initialize: () => {
    const storedDataset = loadDataset();
    const storedViews = loadViews();

    if (storedDataset && storedDataset.rows.length) {
      const metas = profileDataset(storedDataset.rows, storedDataset.headers);
      const nextFilters = {
        ...defaultFilters,
        dateColumn: metas.find((meta) => meta.type === "date")?.key,
        categoryColumn: metas.find((meta) => meta.type === "string" && meta.uniquenessRatio < 0.5)?.key,
        numericColumn: metas.find((meta) => meta.type === "number")?.key,
      };

      const derived = recompute({
        rows: storedDataset.rows,
        metas,
        filters: nextFilters,
        grouping: defaultGrouping,
      });

      set({
        datasetName: storedDataset.name,
        headers: storedDataset.headers,
        rows: storedDataset.rows,
        metas,
        filters: nextFilters,
        views: storedViews,
        ...derived,
      });
      return;
    }

    set({ views: storedViews });
  },

  setDataset: (name, headers, rows) => {
    const metas = profileDataset(rows, headers);
    const numeric = metas.find((meta) => meta.type === "number");
    const numericStats = numeric?.stats as { min?: number; max?: number } | undefined;

    const filters: FilterState = {
      ...defaultFilters,
      dateColumn: metas.find((meta) => meta.type === "date")?.key,
      categoryColumn: metas.find((meta) => meta.type === "string" && meta.uniquenessRatio < 0.5)?.key ?? metas.find((meta) => meta.type === "string")?.key,
      numericColumn: numeric?.key,
      numericRange: numericStats ? { min: numericStats.min, max: numericStats.max } : undefined,
    };

    const derived = recompute({ rows, metas, filters, grouping: defaultGrouping });

    set({
      datasetName: name,
      headers,
      rows,
      metas,
      filters,
      grouping: defaultGrouping,
      error: undefined,
      loadingProgress: 100,
      ...derived,
    });

    saveDataset({ name, headers, rows, sample: rows.slice(0, 200), metas });
  },

  setLoadingProgress: (loadingProgress) => set({ loadingProgress }),

  setError: (error) => set({ error }),

  patchFilters: (patch) => {
    const nextFilters = normalizeFilters({ ...get().filters, ...patch });
    const derived = recompute({
      rows: get().rows,
      metas: get().metas,
      filters: nextFilters,
      grouping: get().grouping,
    });
    set({ filters: nextFilters, ...derived });
  },

  resetFilters: () => {
    const state = get();
    const filters: FilterState = {
      ...defaultFilters,
      dateColumn: state.metas.find((meta) => meta.type === "date")?.key,
      categoryColumn: state.metas.find((meta) => meta.type === "string" && meta.uniquenessRatio < 0.5)?.key,
      numericColumn: state.metas.find((meta) => meta.type === "number")?.key,
    };

    const derived = recompute({ rows: state.rows, metas: state.metas, filters, grouping: state.grouping });
    set({ filters, ...derived });
  },

  setGrouping: (patch) => {
    const grouping = { ...get().grouping, ...patch };
    const derived = recompute({
      rows: get().rows,
      metas: get().metas,
      filters: get().filters,
      grouping,
    });
    set({ grouping, ...derived });
  },

  clearDataset: () => {
    clearDataset();
    set({
      datasetName: "",
      headers: [],
      rows: [],
      metas: [],
      loadingProgress: 0,
      error: undefined,
      filters: defaultFilters,
      grouping: defaultGrouping,
      activeViewId: "default",
      summaries: [],
      charts: [],
      mainChart: undefined,
      filteredRows: [],
    });
  },

  saveCurrentView: (name) => {
    const state = get();
    const id = `${Date.now()}`;
    const view: ViewConfig = {
      id,
      name,
      filters: state.filters,
      grouping: state.grouping,
      chartOrder: state.charts.map((chart) => chart.id),
    };
    const views = [...state.views, view];
    saveViews(views);
    set({ views, activeViewId: id });
  },

  applyView: (id) => {
    if (id === "default") {
      get().resetFilters();
      set({ grouping: defaultGrouping, activeViewId: "default" });
      return;
    }

    const view = get().views.find((item) => item.id === id);
    if (!view) return;
    const normalizedFilters = normalizeFilters(view.filters);
    const derived = recompute({ rows: get().rows, metas: get().metas, filters: normalizedFilters, grouping: view.grouping });
    set({ filters: normalizedFilters, grouping: view.grouping, activeViewId: id, ...derived });
  },

  deleteView: (id) => {
    const views = get().views.filter((view) => view.id !== id);
    saveViews(views);
    set({ views, activeViewId: "default" });
  },

  importViews: (views) => {
    saveViews(views);
    set({ views });
  },
}));
