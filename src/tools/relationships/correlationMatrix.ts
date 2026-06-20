import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { pearson, round, spearman } from "../../lib/statistics";

export function runCorrelationMatrix(dataset: Dataset, settings: Record<string, unknown>): CalculationResult {
  const columns = Array.isArray(settings.columns) ? settings.columns.map(String) : [];
  const method = settings.method === "spearman" ? "spearman" : "pearson";
  if (columns.length < 2) throw new Error("Выберите минимум два столбца.");

  const rows = columns.map((rowColumn) => {
    const row: Record<string, string | number> = { Переменная: rowColumn };
    columns.forEach((column) => {
      const pairs = dataset.rows
        .map((item) => [item[rowColumn], item[column]])
        .filter((pair): pair is [number, number] => pair.every((value) => typeof value === "number" && Number.isFinite(value)));
      if (pairs.length < 2) row[column] = "Недостаточно данных";
      else {
        const value = method === "pearson"
          ? pearson(pairs.map((pair) => pair[0]), pairs.map((pair) => pair[1]))
          : spearman(pairs.map((pair) => pair[0]), pairs.map((pair) => pair[1]));
        row[column] = Number.isFinite(value) ? round(value) : "Не определено";
      }
    });
    return row;
  });

  return createCalculationResult([
    { type: "table", title: `Корреляционная матрица (${method === "pearson" ? "Пирсон" : "Спирмен"})`, columns: ["Переменная", ...columns], rows },
    { type: "text", title: "Примечание", content: "Пропуски исключались попарно отдельно для каждой пары переменных." }
  ]);
}
