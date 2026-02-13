import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { FileUp, Sparkles } from "lucide-react";

type DropzoneProps = {
  onFile: (file: File) => void;
  onSample: () => void;
  loading: boolean;
  progress: number;
  compact?: boolean;
};

export function Dropzone({
  onFile,
  onSample,
  loading,
  progress,
  compact = false,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) onFile(file);
  };

  if (compact) {
    return (
      <div className="w-full">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300"
        >
          <FileUp size={14} />
          Upload New CSV
        </button>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.currentTarget.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <section className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50 dark:shadow-none">
      {/* Decorative gradient border effect on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-0 transition-opacity duration-500 group-hover:opacity-10 ${dragActive ? "opacity-20" : ""}`}
      />

      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-all duration-300 ${
          dragActive
            ? "border-emerald-500 bg-emerald-50/50 scale-[0.99] dark:border-emerald-500/50 dark:bg-emerald-950/20"
            : "border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 shadow-inner dark:bg-slate-800">
          {loading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
          ) : (
            <FileUp className="h-8 w-8 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {loading ? "Analyzing your data..." : "Drop your CSV here"}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {loading
            ? "We are parsing the file locally. This might take a few seconds."
            : "or click to browse your files. Supports standard CSV formats."}
        </p>

        {!loading && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              onClick={() => inputRef.current?.click()}
            >
              <FileUp size={18} />
              Choose local file
            </button>
            <div className="text-xs font-semibold text-slate-400">OR</div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700"
              onClick={onSample}
            >
              <Sparkles size={18} />
              Try sample data
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.currentTarget.value = "";
          }}
        />

        {loading && (
          <div className="mt-8 w-full max-w-xs">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Parsing...</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
