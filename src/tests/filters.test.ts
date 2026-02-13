import { describe, expect, it } from "vitest";
import { applyFilters } from "../domain/filters";

describe("filters", () => {
  const rows = [
    { date: "2025-01-01", category: "A", amount: "10", label: "hello" },
    { date: "2025-01-10", category: "B", amount: "20", label: "world" },
    { date: "2025-01-20", category: "A", amount: "30", label: "other" },
  ];

  it("applies search + category + range filters", () => {
    const filtered = applyFilters(rows, {
      search: "o",
      categoryColumn: "category",
      categoryValues: ["B"],
      numericColumn: "amount",
      numericRange: { min: 10, max: 25 },
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].category).toBe("B");
  });

  it("applies date range", () => {
    const filtered = applyFilters(rows, {
      search: "",
      categoryValues: [],
      dateColumn: "date",
      dateRange: { from: "2025-01-05", to: "2025-01-15" },
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].date).toBe("2025-01-10");
  });
});
