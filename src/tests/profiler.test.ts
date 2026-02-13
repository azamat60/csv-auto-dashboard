import { describe, expect, it } from "vitest";
import { profileDataset, isMissing, parseNumber } from "../domain/profiler";

describe("profiler", () => {
  it("detects numeric and date columns with edge formats", () => {
    const rows = [
      { amount: "1,234.56", created_at: "2025-01-01", name: "Alice" },
      { amount: "1234,56", created_at: "02.01.2025", name: "Bob" },
      { amount: "-", created_at: "2025/01/03", name: "Charlie" },
    ];

    const metas = profileDataset(rows, ["amount", "created_at", "name"]);

    expect(metas.find((m) => m.key === "amount")?.type).toBe("number");
    expect(metas.find((m) => m.key === "created_at")?.type).toBe("date");
    expect(metas.find((m) => m.key === "name")?.type).toBe("string");
  });

  it("handles missing values", () => {
    expect(isMissing("")).toBe(true);
    expect(isMissing("N/A")).toBe(true);
    expect(isMissing("na")).toBe(true);
    expect(isMissing("-")).toBe(true);
    expect(isMissing("ok")).toBe(false);
  });

  it("parses localized numbers", () => {
    expect(parseNumber("1,234.56")).toBe(1234.56);
    expect(parseNumber("1234,56")).toBe(1234.56);
    expect(parseNumber("x1")).toBeUndefined();
  });
});
