import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { pearson, round, spearman } from "../../lib/statistics";
import { inferColumnKind } from "../../lib/columnTypes";

export type CorrelationMethod = "pearson" | "spearman";

export function calculateCorrelationMatrix(
  dataset: Dataset,
  columns: string[],
  method: CorrelationMethod
): number[][] {
  return columns.map((rowColumn) =>
    columns.map((column) => {
      const pairs = dataset.rows
        .map((item) => [item[rowColumn], item[column]])
        .filter(
          (pair): pair is [number, number] =>
            pair.every(
              (value) => typeof value === "number" && Number.isFinite(value)
            )
        );
      if (pairs.length < 2) return Number.NaN;
      return method === "pearson"
        ? pearson(pairs.map((pair) => pair[0]), pairs.map((pair) => pair[1]))
        : spearman(pairs.map((pair) => pair[0]), pairs.map((pair) => pair[1]));
    })
  );
}

export function runCorrelationMatrix(dataset: Dataset, settings: Record<string, unknown>): CalculationResult {
  const columns = Array.isArray(settings.columns) ? settings.columns.map(String) : [];
  const method: CorrelationMethod = settings.method === "spearman" ? "spearman" : "pearson";
  if (columns.length < 2) throw new Error("Выберите минимум два столбца.");
  if (columns.some((column) => inferColumnKind(dataset, column) !== "numeric")) {
    throw new Error("Корреляционная матрица строится только для числовых переменных.");
  }
  const matrix = calculateCorrelationMatrix(dataset, columns, method);

  const rows = columns.map((rowColumn, rowIndex) => {
    const row: Record<string, string | number> = { Переменная: rowColumn };
    columns.forEach((column, columnIndex) => {
      const value = matrix[rowIndex][columnIndex];
      row[column] = Number.isFinite(value) ? round(value) : "Не определено";
    });
    return row;
  });

  return createCalculationResult([
    { type: "table", title: `Корреляционная матрица (${method === "pearson" ? "Пирсон" : "Спирмен"})`, columns: ["Переменная", ...columns], rows },
    { type: "text", title: "Примечание", content: "Пропуски исключались попарно отдельно для каждой пары переменных." }
  ]);
}

export function runCorrelationHeatmap(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  return runCorrelationMatrix(dataset, settings);
}
