# CSV -> Auto Dashboard (Data -> Insight)

Frontend-only analytics app that turns a CSV file into an instant dashboard with summaries, auto charts, filters, grouping, and a virtualized table.

## Stack

- React + TypeScript + Vite
- Zustand (state + memoized selectors)
- PapaParse (CSV parsing)
- Recharts (charts)
- react-window (virtualized table)
- dayjs (date handling)
- Vitest + React Testing Library (tests)
- ESLint + Prettier + Tailwind CSS

## Run

```bash
npm install
npm run dev
npm run test
```

## Features

- Drag-and-drop CSV import + file picker
- Progress indicator while parsing
- Friendly parse errors
- Last dataset persisted in localStorage (full if small, sample if large)
- Sample dataset mode (`src/assets/sample.csv`)
- Auto data profiling per column:
  - `number`, `date`, `string`, `boolean`, `id-like`
  - numeric stats: min, max, mean, median, p95, variance, missing
  - date stats: min/max range, parse success rate, missing
  - string stats: unique count + top values
- Insight engine that auto-generates:
  - summary cards
  - up to 6 prioritized charts
- Global filters:
  - date range
  - category multi-select
  - numeric range
  - debounced global search
- Grouping controls (`groupBy`, `metric`, `aggregation`) with main chart override
- Virtualized data table with sorting + per-column contains filters
- Views in localStorage:
  - save/apply/delete
  - export/import JSON
  - reset view
- Light theme by default + theme switcher (light/dark)

## How Auto Insights Pick Charts

The insight engine inspects profiled columns and renders charts in priority order:

1. Time series if at least one `date` + one `number` column exists.
2. Top categories bar chart if `string` + `number` exists.
3. Histogram for the most interesting numeric column (highest variance).
4. Boolean distribution chart when a boolean column exists.
5. Scatter chart for the first two numeric columns (capped sample).

It renders up to 6 charts total.

## View Data Model

Each saved view stores dashboard behavior (not dataset rows):

```ts
type ViewConfig = {
  id: string;
  name: string;
  filters: FilterState;
  grouping: GroupingConfig;
  chartOrder: string[];
};
```

Views are persisted in localStorage and can be shared via JSON export/import.

## Performance Approach and Tradeoffs

- CSV parsing uses PapaParse with worker mode when available.
- Filtering and insight recomputation are centralized in Zustand and recalculated only on state changes.
- Global text search is debounced (400ms).
- Raw table rows are virtualized with `react-window`.

Tradeoffs:

- No backend means memory usage depends on browser limits.
- Very large CSV files may still need incremental UX optimizations beyond the current MVP.
- Current ID-like detection is heuristic and may classify edge columns differently for unusual datasets.
