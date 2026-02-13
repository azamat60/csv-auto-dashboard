import type { ViewConfig } from "../domain/types";

export const CURRENT_VIEW_SCHEMA = 1;

export type StoredViews = {
  version: number;
  views: ViewConfig[];
};

export function migrateViews(input: unknown): StoredViews {
  if (!input || typeof input !== "object") {
    return { version: CURRENT_VIEW_SCHEMA, views: [] };
  }

  const obj = input as Partial<StoredViews>;
  if (!Array.isArray(obj.views)) {
    return { version: CURRENT_VIEW_SCHEMA, views: [] };
  }

  return {
    version: CURRENT_VIEW_SCHEMA,
    views: obj.views,
  };
}
