import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, MoonStar, Sun, Trash2 } from "lucide-react";
import sampleCsv from "../assets/sample.csv?raw";
import { ChartCard } from "../components/ChartCard";
import { DataTable } from "../components/DataTable";
import { Dropzone } from "../components/Dropzone";
import { FiltersPanel } from "../components/FiltersPanel";
import { SummaryCards } from "../components/SummaryCards";
import { ViewSelector } from "../components/ViewSelector";
import { parseCsvFile, parseCsvText } from "../domain/csvParse";
import { useDashboardState, useFilterOptions } from "../state/selectors";
import { useAppStore } from "../state/store";

export default function App() {
  const initialize = useAppStore((state) => state.initialize);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [showDeleteDatasetModal, setShowDeleteDatasetModal] = useState(false);

  const {
    datasetName,
    headers,
    loadingProgress,
    error,
    filters,
    grouping,
    views,
    activeViewId,
    summaries,
    charts,
    mainChart,
    filteredRows,
    setDataset,
    setLoadingProgress,
    setError,
    patchFilters,
    resetFilters,
    setGrouping,
    clearDataset,
    saveCurrentView,
    applyView,
    deleteView,
    importViews,
  } = useDashboardState();

  const { dateColumns, stringColumns, numericColumns, categoryValues } =
    useFilterOptions();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const hasData = headers.length > 0;
  const visibleCharts = useMemo(
    () => (mainChart ? [mainChart, ...charts] : charts),
    [mainChart, charts],
  );

  const loadFile = async (file: File) => {
    try {
      setError(undefined);
      setLoadingProgress(1);
      const { headers: nextHeaders, rows } = await parseCsvFile(
        file,
        setLoadingProgress,
      );
      setDataset(file.name, nextHeaders, rows);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to parse CSV";
      setError(message);
      setLoadingProgress(0);
    }
  };

  const loadSample = () => {
    try {
      const { headers: nextHeaders, rows } = parseCsvText(sampleCsv);
      setDataset("sample-ecommerce.csv", nextHeaders, rows);
    } catch {
      setError("Failed to load sample dataset.");
    }
  };

  const downloadSample = () => {
    // Prepend BOM and sep= directive to force Excel to use comma as separator
    const blob = new Blob(["\uFEFFsep=,\n" + sampleCsv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "test-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-20 blur-[100px] dark:bg-emerald-600/30"></div>
        <div className="absolute right-0 top-0 -z-10 h-[310px] w-[310px] rounded-full bg-cyan-500 opacity-20 blur-[100px] dark:bg-cyan-600/30"></div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 text-white shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <line x1="3" x2="21" y1="9" y2="9" />
                  <line x1="9" x2="9" y1="21" y2="9" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  CSV
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Insight
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {datasetName && (
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100/50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 sm:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {datasetName}
                </div>
              )}

              {hasData && (
                <button
                  onClick={() => setShowDeleteDatasetModal(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete data
                </button>
              )}

              <button
                onClick={() =>
                  setTheme((prev) => (prev === "light" ? "dark" : "light"))
                }
                className="group relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-emerald-400"
                aria-label="Toggle theme"
              >
                {theme === "light" ? (
                  <Sun className="h-5 w-5 transition-transform duration-500 group-hover:rotate-90" />
                ) : (
                  <MoonStar className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-12" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Hero / Upload Section */}
            {!hasData && (
              <div className="mx-auto max-w-2xl py-12 text-center">
                <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-white sm:text-4xl">
                  Turn your CSV into{" "}
                  <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                    insights
                  </span>{" "}
                  instantly
                </h2>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                  Upload your data and get an interactive dashboard with charts,
                  summaries, and filters. Only runs in your browser.
                </p>

                <div className="mt-8">
                  <Dropzone
                    onFile={loadFile}
                    onSample={loadSample}
                    loading={loadingProgress > 0 && loadingProgress < 100}
                    progress={loadingProgress}
                  />
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={downloadSample}
                    className="inline-flex items-center gap-2 rounded-lg py-2 px-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <Download className="h-4 w-4" />
                    Download example CSV structure
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/50 dark:bg-rose-950/30">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-rose-100 p-1 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" x2="12" y1="8" y2="12" />
                      <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-rose-900 dark:text-rose-200">
                      Processing Error
                    </h3>
                    <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Dashboard */}
            {hasData && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Upload compact bar when data exists */}
                <div className="hidden">
                  {/* We can add a minimized dropzone or "Upload new" button here later if needed */}
                </div>

                <SummaryCards cards={summaries} />

                <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
                  {/* Left Sidebar: Filters & Controls */}
                  <div className="space-y-6">
                    <div className="sticky top-20 space-y-6 pr-1">
                      <FiltersPanel
                        filters={filters}
                        grouping={grouping}
                        dateColumns={dateColumns}
                        stringColumns={stringColumns}
                        numericColumns={numericColumns}
                        categoryValues={categoryValues}
                        onPatchFilters={patchFilters}
                        onGrouping={setGrouping}
                        onReset={resetFilters}
                      />

                      <ViewSelector
                        views={views}
                        activeViewId={activeViewId}
                        onApply={applyView}
                        onSave={saveCurrentView}
                        onDelete={deleteView}
                        onImport={importViews}
                      />

                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                          Actions
                        </h3>
                        <div className="mt-3 space-y-2">
                          <button
                            onClick={downloadSample}
                            className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download Sample CSV
                          </button>
                          <div className="pt-2">
                            <Dropzone
                              onFile={loadFile}
                              onSample={loadSample}
                              loading={
                                loadingProgress > 0 && loadingProgress < 100
                              }
                              progress={loadingProgress}
                              compact
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content: Charts & Data */}
                  <div className="space-y-6 min-w-0">
                    <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
                      {visibleCharts.map((chart) => (
                        <ChartCard
                          key={chart.id}
                          chart={chart}
                          onSelectValue={(column, value) =>
                            patchFilters({
                              chartSelection: { column, values: [value] },
                            })
                          }
                        />
                      ))}
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          Data Table
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {filteredRows.length} rows found
                        </p>
                      </div>
                      <DataTable headers={headers} rows={filteredRows} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {showDeleteDatasetModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-rose-100 p-2 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Delete current dataset?
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    This will remove the loaded CSV and reset the dashboard.
                    Saved views stay intact.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteDatasetModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    clearDataset();
                    setShowDeleteDatasetModal(false);
                  }}
                  className="rounded-lg border border-rose-300/70 bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-500 dark:border-rose-900/70"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-auto border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>Created by Azamat Altymyshev</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
