import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { inferColumnKind } from "../../lib/columnTypes";

function rank(values: number[]): number[] {
  const sorted = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);

  const ranks = new Array(values.length);
  let i = 0;

  while (i < sorted.length) {
    let j = i;

    while (j + 1 < sorted.length && sorted[j + 1].value === sorted[i].value) {
      j++;
    }

    const averageRank = (i + 1 + j + 1) / 2;

    for (let k = i; k <= j; k++) {
      ranks[sorted[k].index] = averageRank;
    }

    i = j + 1;
  }

  return ranks;
}

function pearsonFromArrays(x: number[], y: number[]): number {
  const meanX = x.reduce((sum, value) => sum + value, 0) / x.length;
  const meanY = y.reduce((sum, value) => sum + value, 0) / y.length;

  const numerator = x.reduce(
    (sum, value, index) => sum + (value - meanX) * (y[index] - meanY),
    0
  );

  const denominator =
    Math.sqrt(x.reduce((sum, value) => sum + Math.pow(value - meanX, 2), 0)) *
    Math.sqrt(y.reduce((sum, value) => sum + Math.pow(value - meanY, 2), 0));

  return numerator / denominator;
}

export function runSpearmanCorrelation(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const xColumn = String(settings.xColumn);
  const yColumn = String(settings.yColumn);
  const alpha = Number(settings.alpha);

  if (!xColumn || !yColumn) {
    throw new Error("Выберите две переменные.");
  }

  if (xColumn === yColumn) {
    throw new Error("Выберите две разные переменные.");
  }

  if (
    inferColumnKind(dataset, xColumn) !== "numeric" ||
    inferColumnKind(dataset, yColumn) !== "numeric"
  ) {
    throw new Error("Корреляция рассчитывается только для числовых переменных.");
  }

  if (Number.isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    throw new Error("Уровень значимости α должен быть числом от 0 до 1.");
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
    throw new Error("Недостаточно числовых пар наблюдений.");
  }

  const xRanks = rank(pairs.map((item) => item.x));
  const yRanks = rank(pairs.map((item) => item.y));

  const rho = pearsonFromArrays(xRanks, yRanks);
  const n = pairs.length;

  const t = (rho * Math.sqrt(n - 2)) / Math.sqrt(1 - rho * rho);
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));

  const decision =
    pValue < alpha
      ? "Нулевая гипотеза отвергается."
      : "Нет оснований отвергнуть нулевую гипотезу.";

  return createCalculationResult([
    {
      type: "table",
      title: "Корреляция Спирмена",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Переменная X", Значение: xColumn },
        { Показатель: "Переменная Y", Значение: yColumn },
        { Показатель: "n", Значение: n },
        { Показатель: "ρ", Значение: Number(rho.toFixed(4)) },
        { Показатель: "t", Значение: Number(t.toFixed(4)) },
        { Показатель: "p-value", Значение: Number(pValue.toFixed(6)) },
        { Показатель: "α", Значение: alpha }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content: "ρ = corr(rank(x), rank(y))"
    },
    {
      type: "text",
      title: "Вывод",
      content: `${decision} Коэффициент Спирмена показывает монотонную связь между переменными.`
    }
  ]);
}
