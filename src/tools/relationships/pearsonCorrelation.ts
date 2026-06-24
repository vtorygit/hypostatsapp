import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { inferColumnKind } from "../../lib/columnTypes";

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function runPearsonCorrelation(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const xColumn = String(settings.xColumn);
  const yColumn = String(settings.yColumn);
  const alpha = Number(settings.alpha);

  if (
    inferColumnKind(dataset, xColumn) !== "numeric" ||
    inferColumnKind(dataset, yColumn) !== "numeric"
  ) {
    throw new Error("Корреляция рассчитывается только для числовых переменных.");
  }

  const pairs = dataset.rows
    .map((row) => ({
      x: row[xColumn],
      y: row[yColumn]
    }))
    .filter(
      (item) =>
        typeof item.x === "number" &&
        !Number.isNaN(item.x) &&
        typeof item.y === "number" &&
        !Number.isNaN(item.y)
    ) as Array<{ x: number; y: number }>;

  if (pairs.length < 3) {
    throw new Error("Недостаточно данных.");
  }

  const x = pairs.map((item) => item.x);
  const y = pairs.map((item) => item.y);

  const meanX = mean(x);
  const meanY = mean(y);

  const numerator = x.reduce(
    (sum, value, index) =>
      sum + (value - meanX) * (y[index] - meanY),
    0
  );

  const denominator =
    Math.sqrt(
      x.reduce((sum, value) => sum + Math.pow(value - meanX, 2), 0)
    ) *
    Math.sqrt(
      y.reduce((sum, value) => sum + Math.pow(value - meanY, 2), 0)
    );

  const r = numerator / denominator;

  const n = pairs.length;
  const t = (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r);

  const pValue =
    2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));

  const interpretation =
    Math.abs(r) < 0.1
      ? "Практически отсутствует."
      : Math.abs(r) < 0.3
      ? "Слабая."
      : Math.abs(r) < 0.5
      ? "Умеренная."
      : Math.abs(r) < 0.7
      ? "Заметная."
      : "Сильная.";

  return createCalculationResult([
    {
      type: "table",
      title: "Корреляция Пирсона",
      columns: ["Показатель", "Значение"],
      rows: [
        {
          Показатель: "Переменная X",
          Значение: xColumn
        },
        {
          Показатель: "Переменная Y",
          Значение: yColumn
        },
        {
          Показатель: "n",
          Значение: n
        },
        {
          Показатель: "r",
          Значение: Number(r.toFixed(4))
        },
        {
          Показатель: "t",
          Значение: Number(t.toFixed(4))
        },
        {
          Показатель: "p-value",
          Значение: Number(pValue.toFixed(6))
        }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content:
        "t = r√(n−2)/√(1−r²)"
    },
    {
      type: "text",
      title: "Интерпретация",
      content: `Коэффициент корреляции r = ${r.toFixed(
        4
      )}. Связь: ${interpretation}`
    }
  ]);
}
