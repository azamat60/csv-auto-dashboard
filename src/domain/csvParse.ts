import Papa from "papaparse";
import type { DataRow } from "./types";

const missingHeaderPrefix = "column";

function getFatalParseError(
  errors: Array<{ code?: string; message: string }>,
): { message: string } | undefined {
  return errors.find((error) => error.code !== "UndetectableDelimiter");
}

function sanitizeHeader(value: string, index: number): string {
  const trimmed = (value || "").trim();
  return trimmed ? trimmed : `${missingHeaderPrefix}_${index + 1}`;
}

export function normalizeHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();

  return headers.map((raw, index) => {
    const base = sanitizeHeader(raw, index)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toLowerCase();

    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}_${count + 1}`;
  });
}

function mapRows(data: string[][]): { headers: string[]; rows: DataRow[] } {
  if (!data.length) return { headers: [], rows: [] };
  const [rawHeaders, ...body] = data;
  const headers = normalizeHeaders(
    rawHeaders.map((value) => String(value ?? "")),
  );

  const rows = body
    .filter((row) => row.some((cell) => String(cell ?? "").trim().length > 0))
    .map((row) =>
      headers.reduce<DataRow>((acc, header, index) => {
        acc[header] = String(row[index] ?? "");
        return acc;
      }, {}),
    );

  return { headers, rows };
}

function looksLikeSingleColumnCsv(data: string[][]): boolean {
  if (!data.length || !data[0]?.length) return false;
  if (data[0].length !== 1) return false;
  const firstCell = String(data[0][0] ?? "");
  return (
    firstCell.includes(",") ||
    firstCell.includes(";") ||
    firstCell.includes("\t")
  );
}

function reparsedByDelimiter(text: string, delimiter: string): string[][] {
  const result = Papa.parse<string[]>(text, {
    delimiter,
    skipEmptyLines: true,
  });
  if (getFatalParseError(result.errors)) return [];
  return result.data as unknown as string[][];
}

function recoverCollapsedCsv(text: string, parsedRows: string[][]): string[][] {
  if (!looksLikeSingleColumnCsv(parsedRows)) return parsedRows;

  const candidates = [",", ";", "\t"];
  let bestRows = parsedRows;

  for (const delimiter of candidates) {
    const rows = reparsedByDelimiter(text, delimiter);
    const headerWidth = rows[0]?.length ?? 0;
    const bestWidth = bestRows[0]?.length ?? 0;
    if (headerWidth > bestWidth) {
      bestRows = rows;
    }
  }

  // Excel one-column re-save case:
  // each CSV row is a quoted single field like "a,b,c".
  // After first parse quotes are removed and we can reparse by joining raw cell values.
  if ((bestRows[0]?.length ?? 0) <= 1) {
    const flattenedText = parsedRows
      .map((row) => String(row[0] ?? ""))
      .join("\n");
    for (const delimiter of candidates) {
      const rows = reparsedByDelimiter(flattenedText, delimiter);
      const headerWidth = rows[0]?.length ?? 0;
      const bestWidth = bestRows[0]?.length ?? 0;
      if (headerWidth > bestWidth) {
        bestRows = rows;
      }
    }
  }

  return bestRows;
}

export function parseCsvFile(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<{ headers: string[]; rows: DataRow[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = parseCsvText(text);

        if (!parsed.headers.length) {
          reject(new Error("CSV headers could not be detected."));
          return;
        }

        onProgress?.(100);
        resolve(parsed);
      } catch (err) {
        reject(
          err instanceof Error ? err : new Error("Failed to parse CSV file"),
        );
      }
    };

    reader.onerror = () => {
      reject(reader.error || new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
}

export function parseCsvText(text: string): {
  headers: string[];
  rows: DataRow[];
} {
  // Remove BOM and "sep=" line if present
  const cleanText = text.replace(/^\uFEFF/, "").replace(/^sep=.*\n/, "");

  const result = Papa.parse<string[]>(cleanText, {
    skipEmptyLines: true,
  });

  const fatalError = getFatalParseError(result.errors);
  if (fatalError) {
    throw new Error(fatalError.message);
  }

  const parsedRows = result.data as unknown as string[][];
  const recoveredRows = recoverCollapsedCsv(cleanText, parsedRows);
  return mapRows(recoveredRows);
}
