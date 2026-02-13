import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { DataRow } from "../domain/types";

type DataTableProps = {
  headers: string[];
  rows: DataRow[];
};

export function DataTable({ headers, rows }: DataTableProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(rows.length / pageSize);

  const start = (page - 1) * pageSize;
  const visibleRows = rows.slice(start, start + pageSize);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  if (!headers.length) return null;

  const isBooleanCell = (value: string) =>
    value.toLowerCase() === "true" || value.toLowerCase() === "false";

  const isNumericLike = (value: string) =>
    /^-?\d+([.,]\d+)?$/.test(value.trim());

  return (
    <div className="flex flex-col">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-max text-left text-sm">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100/60 text-slate-500 dark:from-slate-900 dark:to-slate-900/70 dark:text-slate-400">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap border-b border-slate-200 px-6 py-3 font-semibold uppercase tracking-wider dark:border-slate-800"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleRows.map((row, i) => (
              <tr
                key={i}
                className="group transition-colors odd:bg-white even:bg-slate-50/55 hover:bg-cyan-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-900/75 dark:hover:bg-cyan-950/20"
              >
                {headers.map((h) => (
                  <td
                    key={h}
                    className={`whitespace-nowrap px-6 py-3 ${
                      isNumericLike(row[h] ?? "")
                        ? "font-medium tabular-nums text-slate-800 dark:text-slate-200"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isBooleanCell(row[h] ?? "") ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          row[h].toLowerCase() === "true"
                            ? "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/40"
                            : "bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/40"
                        }`}
                      >
                        {row[h]}
                      </span>
                    ) : (
                      row[h]
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-6 py-12 text-center text-slate-500 dark:text-slate-400"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {start + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {Math.min(start + pageSize, rows.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {rows.length}
            </span>{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={!canPrev}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!canPrev}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="mx-2 text-sm font-medium text-slate-900 dark:text-white">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={!canNext}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={!canNext}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
