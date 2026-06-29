import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import {
  getNumericValues,
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

export function runOneSampleTTest(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const column = String(settings.column);
  const mu0 = Number(settings.mu0);
  const alpha = Number(settings.alpha);
  const alternative = settings.alternative as Alternative;

  if (!column) {
    throw new Error("Выберите числовой столбец.");
  }

  if (Number.isNaN(mu0)) {
    throw new Error("Проверяемое среднее должно быть числом.");
  }

  if (Number.isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    throw new Error("Уровень значимости α должен быть числом от 0 до 1.");
  }

  const values = getNumericValues(dataset, column);
  validateNumericSample(values, "Выбранный столбец");

  const n = values.length;
  const xMean = mean(values);
  const sd = sampleStandardDeviation(values);
  const standardError = sd / Math.sqrt(n);
  const t = (xMean - mu0) / standardError;
  const df = n - 1;
  const pValue = getPValue(t, df, alternative);

  const decision =
    pValue < alpha
      ? "Нулевая гипотеза отвергается."
      : "Нет оснований отвергнуть нулевую гипотезу.";

  return createCalculationResult([
    {
      type: "table",
      title: "Результаты t-теста для одной выборки",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Столбец", Значение: column },
        { Показатель: "n", Значение: n },
        { Показатель: "Выборочное среднее", Значение: Number(xMean.toFixed(4)) },
        { Показатель: "Проверяемое среднее", Значение: mu0 },
        { Показатель: "Стандартное отклонение", Значение: Number(sd.toFixed(4)) },
        { Показатель: "Стандартная ошибка", Значение: Number(standardError.toFixed(4)) },
        { Показатель: "df", Значение: df },
        { Показатель: "t-статистика", Значение: Number(t.toFixed(4)) },
        { Показатель: "p-value", Значение: Number(pValue.toFixed(6)) }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content: "t = (x̄ - μ₀) / (s / √n)"
    },
    {
      type: "text",
      title: "Вывод",
      content: decision
    }
  ]);
}
