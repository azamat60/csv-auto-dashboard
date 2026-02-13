import { type ChartSpec } from "../domain/types";
import { ChartRenderer } from "./ChartRenderer.tsx";

type ChartCardProps = {
  chart: ChartSpec;
  onSelectValue: (column: string, value: string) => void;
};

export function ChartCard({ chart, onSelectValue }: ChartCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {chart.title}
          </h3>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            {chart.type}
          </span>
        </div>
        {chart.interactiveFilterKey && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Click bars/points to filter by{" "}
            <strong>{chart.interactiveFilterKey}</strong>
          </p>
        )}
      </div>

      <div className="flex-1 p-6">
        <div
          className={
            chart.type === "pie"
              ? "mx-auto h-[320px] w-full max-w-[540px]"
              : "h-[300px] w-full"
          }
        >
          <ChartRenderer chart={chart} onSelectValue={onSelectValue} />
        </div>
      </div>
    </div>
  );
}
