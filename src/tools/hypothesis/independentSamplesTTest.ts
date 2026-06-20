import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { mean, sampleVariance, validateNumericSample } from "../../lib/numeric";

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

function getGroupValues(
  dataset: Dataset,
  valueColumn: string,
  groupColumn: string,
  groupValue: string
): number[] {
  return dataset.rows
    .filter((row) => String(row[groupColumn]) === groupValue)
    .map((row) => row[valueColumn])
    .filter((value) => typeof value === "number" && !Number.isNaN(value)) as number[];
}

export function runIndependentSamplesTTest(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const valueColumn = String(settings.valueColumn);
  const groupColumn = String(settings.groupColumn);
  const group1Value = String(settings.group1Value);
  const group2Value = String(settings.group2Value);
  const alpha = Number(settings.alpha);
  const alternative = settings.alternative as Alternative;

  if (!valueColumn || !groupColumn || !group1Value || !group2Value) {
    throw new Error("Выберите переменную, группирующий столбец и две группы.");
  }

  if (group1Value === group2Value) {
    throw new Error("Выберите две разные группы.");
  }

  if (Number.isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    throw new Error("Уровень значимости α должен быть числом от 0 до 1.");
  }

  const group1 = getGroupValues(dataset, valueColumn, groupColumn, group1Value);
  const group2 = getGroupValues(dataset, valueColumn, groupColumn, group2Value);

  validateNumericSample(group1, "Группа 1");
  validateNumericSample(group2, "Группа 2");

  const n1 = group1.length;
  const n2 = group2.length;

  const mean1 = mean(group1);
  const mean2 = mean(group2);
  const variance1 = sampleVariance(group1);
  const variance2 = sampleVariance(group2);

  const standardError = Math.sqrt(variance1 / n1 + variance2 / n2);
  const t = (mean1 - mean2) / standardError;

  const dfNumerator = Math.pow(variance1 / n1 + variance2 / n2, 2);
  const dfDenominator =
    Math.pow(variance1 / n1, 2) / (n1 - 1) +
    Math.pow(variance2 / n2, 2) / (n2 - 1);

  const df = dfNumerator / dfDenominator;
  const pValue = getPValue(t, df, alternative);

  const decision =
    pValue < alpha
      ? "Нулевая гипотеза отвергается."
      : "Нет оснований отвергнуть нулевую гипотезу.";

  return createCalculationResult([
    {
      type: "table",
      title: "Результаты t-теста для независимых выборок",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Числовая переменная", Значение: valueColumn },
        { Показатель: "Группа 1", Значение: group1Value },
        { Показатель: "n₁", Значение: n1 },
        { Показатель: "Среднее 1", Значение: Number(mean1.toFixed(4)) },
        { Показатель: "Группа 2", Значение: group2Value },
        { Показатель: "n₂", Значение: n2 },
        { Показатель: "Среднее 2", Значение: Number(mean2.toFixed(4)) },
        { Показатель: "Разность средних", Значение: Number((mean1 - mean2).toFixed(4)) },
        { Показатель: "df", Значение: Number(df.toFixed(4)) },
        { Показатель: "t-статистика", Значение: Number(t.toFixed(4)) },
        { Показатель: "p-value", Значение: Number(pValue.toFixed(6)) },
        { Показатель: "α", Значение: alpha }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content: "t = (x̄₁ - x̄₂) / √(s₁²/n₁ + s₂²/n₂)"
    },
    {
      type: "text",
      title: "Вывод",
      content: `${decision} Использован вариант Welch t-test без предположения о равенстве дисперсий.`
    }
  ]);
}
