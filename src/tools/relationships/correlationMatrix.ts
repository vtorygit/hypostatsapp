import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { pearson, round, spearman } from "../../lib/statistics";
import { inferColumnKind } from "../../lib/columnTypes";
import { jStat } from "jstat";

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

export function calculateCorrelationPValue(r: number, n: number): number {
  if (!Number.isFinite(r) || n < 3 || Math.abs(r) >= 1) {
    return Number.NaN;
  }

  const t = (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r);
  return 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));
}

function getPairs(dataset: Dataset, firstColumn: string, secondColumn: string): Array<[number, number]> {
  return dataset.rows
    .map((item) => [item[firstColumn], item[secondColumn]])
    .filter(
      (pair): pair is [number, number] =>
        pair.every((value) => typeof value === "number" && Number.isFinite(value))
    );
}

export function runCorrelationMatrix(dataset: Dataset, settings: Record<string, unknown>): CalculationResult {
  const columns = Array.isArray(settings.columns) ? settings.columns.map(String) : [];
  const method: CorrelationMethod = settings.method === "spearman" ? "spearman" : "pearson";
  const showSignificance = Boolean(settings.showSignificance);
  const alpha = Number(settings.alpha ?? 0.05);
  if (columns.length < 2) throw new Error("Выберите минимум два столбца.");
  if (columns.some((column) => inferColumnKind(dataset, column) !== "numeric")) {
    throw new Error("Корреляционная матрица строится только для числовых переменных.");
  }
  const matrix = calculateCorrelationMatrix(dataset, columns, method);

  const rows = columns.map((rowColumn, rowIndex) => {
    const row: Record<string, string | number> = { Переменная: rowColumn };
    columns.forEach((column, columnIndex) => {
      const value = matrix[rowIndex][columnIndex];
      if (!Number.isFinite(value)) {
        row[column] = "Не определено";
        return;
      }

      const pairs = getPairs(dataset, rowColumn, column);
      const pValue = calculateCorrelationPValue(value, pairs.length);
      const significant = Number.isFinite(pValue) && pValue < alpha;
      row[column] = showSignificance
        ? `${value.toFixed(2)} (${significant ? "знач." : "незнач."} ${alpha})`
        : round(value);
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
