import type { DatasetState, ViewConfig } from "../domain/types";
import { migrateViews } from "./migrations";

const DATASET_KEY = "csv-dashboard:last-dataset";
const VIEWS_KEY = "csv-dashboard:views";

export type StoredDataset = {
  name: string;
  headers: string[];
  rows: Record<string, string>[];
  sample: Record<string, string>[];
};

export function saveDataset(dataset: DatasetState): void {
  const payload: StoredDataset = {
    name: dataset.name,
    headers: dataset.headers,
    rows: dataset.rows.length <= 2000 ? dataset.rows : dataset.rows.slice(0, 2000),
    sample: dataset.sample,
  };

  localStorage.setItem(DATASET_KEY, JSON.stringify(payload));
}

export function loadDataset(): StoredDataset | null {
  const raw = localStorage.getItem(DATASET_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredDataset;
    if (!Array.isArray(parsed.headers) || !Array.isArray(parsed.rows)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearDataset(): void {
  localStorage.removeItem(DATASET_KEY);
}

export function saveViews(views: ViewConfig[]): void {
  localStorage.setItem(
    VIEWS_KEY,
    JSON.stringify({
      version: 1,
      views,
    }),
  );
}

export function loadViews(): ViewConfig[] {
  const raw = localStorage.getItem(VIEWS_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return migrateViews(parsed).views;
  } catch {
    return [];
  }
}

export function exportViewsJson(views: ViewConfig[]): string {
  return JSON.stringify({ version: 1, views }, null, 2);
}

export function importViewsJson(raw: string): ViewConfig[] {
  const parsed = JSON.parse(raw);
  return migrateViews(parsed).views;
}
