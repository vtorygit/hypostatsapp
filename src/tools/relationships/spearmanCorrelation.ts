import type { Dataset } from "../../types/dataset";
import type { ResultBlock } from "../../types/results";

function rank(values: number[]): number[] {
  return values
    .map((value, index) => ({
      value,
      index
    }))
    .sort((a, b) => a.value - b.value)
    .reduce((result, item, rankIndex) => {
      result[item.index] = rankIndex + 1;
      return result;
    }, [] as number[]);
}

export function runSpearmanCorrelation(
  dataset: Dataset,
  settings: Record<string, unknown>
): ResultBlock[] {
  const xColumn = String(settings.xColumn);
  const yColumn = String(settings.yColumn);

  const pairs = dataset.rows
    .map((row) => ({
      x: row[xColumn],
      y: row[yColumn]
    }))
    .filter(
      (item) =>
        typeof item.x === "number" &&
        typeof item.y === "number"
    ) as Array<{ x: number; y: number }>;

  if (pairs.length < 3) {
    throw new Error("Недостаточно данных.");
  }

  const xRanks = rank(pairs.map((item) => item.x));
  const yRanks = rank(pairs.map((item) => item.y));

  const n = pairs.length;

  const dSquared = xRanks.reduce(
    (sum, rankValue, index) =>
      sum + Math.pow(rankValue - yRanks[index], 2),
    0
  );

  const rho =
    1 -
    (6 * dSquared) /
      (n * (n * n - 1));

  return [
    {
      type: "table",
      title: "Корреляция Спирмена",
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
          Показатель: "ρ",
          Значение: Number(rho.toFixed(4))
        }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content:
        "ρ = 1 − 6Σd² / (n(n²−1))"
    }
  ];
}
