import { useState } from "react";
import { Download, Save, Trash2, Upload } from "lucide-react";
import type { ViewConfig } from "../domain/types";
import { exportViewsJson, importViewsJson } from "../storage/localStorage";

type ViewSelectorProps = {
  views: ViewConfig[];
  activeViewId: string;
  onApply: (id: string) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  onImport: (views: ViewConfig[]) => void;
};

export function ViewSelector({ views, activeViewId, onApply, onSave, onDelete, onImport }: ViewSelectorProps) {
  const [name, setName] = useState("");
  const actionButtonBaseClass =
    "inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all hover:-translate-y-0.5";
  const saveButtonClass =
    `${actionButtonBaseClass} border-cyan-300/60 bg-cyan-50 text-cyan-800 hover:bg-cyan-100 dark:border-cyan-900/70 dark:bg-cyan-950/25 dark:text-cyan-300 dark:hover:bg-cyan-900/40`;
  const exportButtonClass =
    `${actionButtonBaseClass} border-indigo-300/60 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 dark:border-indigo-900/70 dark:bg-indigo-950/25 dark:text-indigo-300 dark:hover:bg-indigo-900/40`;
  const importButtonClass =
    `${actionButtonBaseClass} cursor-pointer border-emerald-300/60 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/70 dark:bg-emerald-950/25 dark:text-emerald-300 dark:hover:bg-emerald-900/40`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-3">
        <label className="text-xs">
          <span className="mb-1 block text-slate-500 dark:text-slate-400">Saved Views</span>
          <select
            className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={activeViewId}
            onChange={(event) => onApply(event.target.value)}
          >
            <option value="default">Default View</option>
            {views.map((view) => (
              <option key={view.id} value={view.id}>
                {view.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs">
          <span className="mb-1 block text-slate-500 dark:text-slate-400">New View Name</span>
          <input
            className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Q1 Focus"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            className={saveButtonClass}
            type="button"
            onClick={() => {
              if (!name.trim()) return;
              onSave(name.trim());
              setName("");
            }}
          >
            <Save size={16} />
            Save View
          </button>

          <button
            className={exportButtonClass}
            type="button"
            onClick={() => {
              const raw = exportViewsJson(views);
              const blob = new Blob([raw], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "csv-dashboard-views.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={16} />
            Export Views
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className={importButtonClass}>
          <Upload size={16} />
          Import Views
          <input
            type="file"
            hidden
            accept="application/json"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const text = await file.text();
              const imported = importViewsJson(text);
              onImport(imported);
            }}
          />
        </label>

        {activeViewId !== "default" ? (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition-all hover:-translate-y-0.5 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900/40"
            type="button"
            onClick={() => onDelete(activeViewId)}
          >
            <Trash2 size={16} />
            Delete View
          </button>
        ) : null}
      </div>
    </section>
  );
}
