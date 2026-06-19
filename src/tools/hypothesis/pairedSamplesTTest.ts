import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import type { ResultBlock } from "../../types/results";
import {
  mean,
  sampleStandardDeviation,
  validateNumericSample
} from "../../lib/numeric";

type Alternative = "two-sided" | "less" | "greater";

function getPValue(t: number, df: number, alternative: Alternative): number {
  if (alternative === "less") {
    return jStat.studentt.cdf(t, df);
  }

  if (alternative === "greater") {
    return 1 - jStat.studentt.cdf(t, df);
  }

  return 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));
}

export function runPairedSamplesTTest(
  dataset: Dataset,
  settings: Record<string, unknown>
): ResultBlock[] {
  const beforeColumn = String(settings.beforeColumn);
  const afterColumn = String(settings.afterColumn);
  const alpha = Number(settings.alpha);
  const alternative = settings.alternative as Alternative;

  if (!beforeColumn || !afterColumn) {
    throw new Error("Выберите два числовых столбца.");
  }

  if (beforeColumn === afterColumn) {
    throw new Error("Для парного t-теста нужны два разных столбца.");
  }

  if (Number.isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    throw new Error("Уровень значимости α должен быть числом от 0 до 1.");
  }

  const differences = dataset.rows
    .map((row) => {
      const before = row[beforeColumn];
      const after = row[afterColumn];

      if (
        typeof before !== "number" ||
        Number.isNaN(before) ||
        typeof after !== "number" ||
        Number.isNaN(after)
      ) {
        return null;
      }

      return after - before;
    })
    .filter((value): value is number => typeof value === "number");

  validateNumericSample(differences, "Парные разности");

  const n = differences.length;
  const meanDifference = mean(differences);
  const sdDifference = sampleStandardDeviation(differences);
  const standardError = sdDifference / Math.sqrt(n);
  const t = meanDifference / standardError;
  const df = n - 1;
  const pValue = getPValue(t, df, alternative);

  const decision =
    pValue < alpha
      ? "Нулевая гипотеза отвергается."
      : "Нет оснований отвергнуть нулевую гипотезу.";

  return [
    {
      type: "table",
      title: "Результаты парного t-теста",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Столбец до", Значение: beforeColumn },
        { Показатель: "Столбец после", Значение: afterColumn },
        { Показатель: "n пар", Значение: n },
        { Показатель: "Средняя разность", Значение: Number(meanDifference.toFixed(4)) },
        { Показатель: "SD разностей", Значение: Number(sdDifference.toFixed(4)) },
        { Показатель: "Стандартная ошибка", Значение: Number(standardError.toFixed(4)) },
        { Показатель: "df", Значение: df },
        { Показатель: "t-статистика", Значение: Number(t.toFixed(4)) },
        { Показатель: "p-value", Значение: Number(pValue.toFixed(6)) },
        { Показатель: "α", Значение: alpha }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content: "t = d̄ / (s_d / √n)"
    },
    {
      type: "text",
      title: "Вывод",
      content: decision
    }
  ];
}
