import { describe, expect, it } from "vitest";
import { parseCsvText } from "../domain/csvParse";

describe("csvParse", () => {
  it("recovers collapsed single-column csv by detecting delimiter", () => {
    const text = [
      "order_id;order_date;category;amount",
      "1001;2025-01-03;Electronics;249.99",
      "1002;2025-01-04;Home;89.50",
    ].join("\n");

    const result = parseCsvText(text);

    expect(result.headers).toEqual(["order_id", "order_date", "category", "amount"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].category).toBe("Electronics");
  });

  it("recovers excel one-column quoted csv rows", () => {
    const text = [
      "\"order_id,order_date,category,amount\"",
      "\"1001,2025-01-03,Electronics,249.99\"",
      "\"1002,2025-01-04,Home,89.50\"",
    ].join("\n");

    const result = parseCsvText(text);

    expect(result.headers).toEqual(["order_id", "order_date", "category", "amount"]);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[1].category).toBe("Home");
  });
});
