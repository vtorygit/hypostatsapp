import type { Dataset } from "../types/dataset";

export type ColumnKind = "numeric" | "categorical";

export function isMissingValue(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

export function inferColumnKind(dataset: Dataset, column: string): ColumnKind {
  const values = dataset.rows
    .map((row) => row[column])
    .filter((value) => !isMissingValue(value));
  return values.length > 0 && values.every(
    (value) => typeof value === "number" && Number.isFinite(value)
  )
    ? "numeric"
    : "categorical";
}

export function getColumnCategories(dataset: Dataset, column: string): string[] {
  return Array.from(
    new Set(
      dataset.rows
        .map((row) => row[column])
        .filter((value) => !isMissingValue(value))
        .map(String)
    )
  );
}
