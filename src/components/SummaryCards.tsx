import { Activity, BarChart3, Calendar, Hash, Type } from "lucide-react";
import type { SummarySpec } from "../domain/types";

export function SummaryCards({ cards }: { cards: SummarySpec[] }) {
  const parseDateRange = (value: string) => {
    const [from, to] = value.split("→").map((part) => part.trim());
    return { from: from ?? "", to: to ?? "" };
  };

  const getIcon = (id: string) => {
    if (id.includes("row")) return <Activity size={20} />;
    if (id.includes("col")) return <BarChart3 size={20} />;
    if (id.includes("date")) return <Calendar size={20} />;
    if (id.includes("num")) return <Hash size={20} />;
    return <Type size={20} />;
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const { from, to } = parseDateRange(card.value);

        return (
          <div
            key={card.id}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:group-hover:bg-emerald-900/50">
                {getIcon(card.id)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-5 text-slate-500 dark:text-slate-400">
                  {card.label}
                </p>
                {card.id === "date-range" ? (
                  <div className="mt-1 space-y-0.5 font-semibold tracking-tight text-slate-900 dark:text-white">
                    <p className="text-lg leading-6">{from}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                      to {to}
                    </p>
                  </div>
                ) : (
                  <p className="mt-0.5 break-words text-xl font-bold leading-7 tracking-tight text-slate-900 dark:text-white">
                    {card.value}
                  </p>
                )}
              </div>
            </div>
            {card.hint && (
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                <span>{card.hint}</span>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
