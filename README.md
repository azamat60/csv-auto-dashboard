# CSV Insight Dashboard

Interactive, client-side CSV analytics dashboard built with React + TypeScript.

Upload a CSV and get instant profiling, filters, charts, and a paginated data table without sending data to a backend.

## Highlights

- Local CSV upload and sample dataset mode
- Smart column profiling (`number`, `date`, `string`, `boolean`, `id-like`)
- Auto-generated summary cards and insight charts
- Filter system with:
  - Global search
  - Date range filter
  - Category checkbox list with `Select all` / partial / none states
  - Numeric range
  - Interactive chart selection
- Saved views (save/apply/delete/export/import)
- Dataset reset flow with confirmation modal
- Light/Dark theme toggle

## Tech Stack

- React 19 + TypeScript
- Vite
- Zustand
- Recharts
- Day.js
- Tailwind CSS
- Vitest + React Testing Library

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Run in development

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Run tests

```bash
npm run test
```

## Project Structure

- `/src/app` - app shell and routes
- `/src/components` - UI blocks (cards, filters, table, chart wrappers)
- `/src/domain` - CSV parsing, profiling, insights, filtering/grouping logic
- `/src/state` - Zustand store and selectors
- `/src/storage` - localStorage persistence and view migration
- `/src/tests` - unit/integration tests

## Notes

- Data processing is fully browser-side.
- Last dataset and saved views are persisted in `localStorage`.
- For very large files, the app stores a capped dataset payload for persistence.

---

Created by **Azamat Altymyshev**.
