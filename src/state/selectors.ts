import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "./store";

export function useDashboardState() {
  return useAppStore(
    useShallow((state) => ({
      datasetName: state.datasetName,
      headers: state.headers,
      rows: state.rows,
      metas: state.metas,
      loadingProgress: state.loadingProgress,
      error: state.error,
      filters: state.filters,
      grouping: state.grouping,
      views: state.views,
      activeViewId: state.activeViewId,
      summaries: state.summaries,
      charts: state.charts,
      mainChart: state.mainChart,
      filteredRows: state.filteredRows,
      setDataset: state.setDataset,
      setLoadingProgress: state.setLoadingProgress,
      setError: state.setError,
      patchFilters: state.patchFilters,
      resetFilters: state.resetFilters,
      setGrouping: state.setGrouping,
      clearDataset: state.clearDataset,
      saveCurrentView: state.saveCurrentView,
      applyView: state.applyView,
      deleteView: state.deleteView,
      importViews: state.importViews,
    })),
  );
}

export function useFilterOptions() {
  const { metas, rows, filters } = useAppStore(
    useShallow((state) => ({ metas: state.metas, rows: state.rows, filters: state.filters })),
  );

  return useMemo(() => {
    const categoryColumn = filters.categoryColumn;
    const values = categoryColumn
      ? Array.from(new Set(rows.map((row) => row[categoryColumn] ?? "").filter(Boolean))).slice(0, 200)
      : [];

    return {
      dateColumns: metas.filter((meta) => meta.type === "date").map((meta) => meta.key),
      stringColumns: metas.filter((meta) => meta.type === "string").map((meta) => meta.key),
      numericColumns: metas.filter((meta) => meta.type === "number").map((meta) => meta.key),
      categoryValues: values,
    };
  }, [filters.categoryColumn, metas, rows]);
}
