import { describe, expect, it } from "vitest";
import { histogram } from "../domain/aggregations";
import { generateInsights } from "../domain/insightEngine";
import { profileDataset } from "../domain/profiler";

describe("insight engine", () => {
  it("builds summaries and at least two charts when data supports", () => {
    const rows = [
      { date: "2025-01-01", category: "A", amount: "10", flag: "true" },
      { date: "2025-01-02", category: "B", amount: "20", flag: "false" },
      { date: "2025-01-03", category: "A", amount: "30", flag: "true" },
    ];

    const metas = profileDataset(rows, ["date", "category", "amount", "flag"]);
    const result = generateInsights(rows, metas);

    expect(result.summaries.length).toBeGreaterThan(2);
    expect(result.charts.length).toBeGreaterThanOrEqual(2);
  });

  it("builds stable histogram bins", () => {
    const result = histogram([1, 2, 3, 4, 5], 2);
    expect(result).toHaveLength(2);
    expect(result[0].count + result[1].count).toBe(5);
  });
});
