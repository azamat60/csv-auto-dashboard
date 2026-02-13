import { describe, expect, it } from "vitest";
import { groupRows } from "../domain/grouping";

describe("grouping", () => {
  const rows = [
    { category: "A", amount: "10" },
    { category: "A", amount: "20" },
    { category: "B", amount: "5" },
  ];

  it("aggregates with sum", () => {
    const result = groupRows(rows, "category", "amount", "sum");
    expect(result[0]).toEqual({ label: "A", value: 30 });
    expect(result[1]).toEqual({ label: "B", value: 5 });
  });

  it("aggregates with count", () => {
    const result = groupRows(rows, "category", "amount", "count");
    expect(result[0]).toEqual({ label: "A", value: 2 });
    expect(result[1]).toEqual({ label: "B", value: 1 });
  });
});
