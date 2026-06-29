import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";

type Alternative = "two-sided" | "less" | "greater";

function getPValue(z: number, alternative: Alternative): number {
  if (alternative === "less") {
    return jStat.normal.cdf(z, 0, 1);
  }

  if (alternative === "greater") {
    return 1 - jStat.normal.cdf(z, 0, 1);
  }

  return 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));
}

function getAlternativeText(alternative: Alternative): string {
  if (alternative === "less") {
    return "доля меньше заданного значения";
  }

  if (alternative === "greater") {
    return "доля больше заданного значения";
  }

  return "доля отличается от заданного значения";
}

export function runOneProportionZTest(
  _dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const successes = Number(settings.successes);
  const sampleSize = Number(settings.sampleSize);
  const hypothesizedProportion = Number(settings.hypothesizedProportion);
  const alpha = Number(settings.alpha);
  const alternative = settings.alternative as Alternative;
  const successValues = Array.isArray(settings.successValues)
    ? settings.successValues.map(String)
    : [];

  if (
    Number.isNaN(successes) ||
    Number.isNaN(sampleSize) ||
    Number.isNaN(hypothesizedProportion) ||
    Number.isNaN(alpha)
  ) {
    throw new Error("Проверьте числовые значения.");
  }

  if (sampleSize <= 0) {
    throw new Error("Размер выборки должен быть больше 0.");
  }

  if (successes < 0 || successes > sampleSize) {
    throw new Error("Количество успехов должно быть от 0 до размера выборки.");
  }

  if (hypothesizedProportion <= 0 || hypothesizedProportion >= 1) {
    throw new Error("Проверяемая доля должна быть между 0 и 1.");
  }

  const observedProportion = successes / sampleSize;

  const standardError = Math.sqrt(
    (hypothesizedProportion * (1 - hypothesizedProportion)) / sampleSize
  );

  const z = (observedProportion - hypothesizedProportion) / standardError;
  const pValue = getPValue(z, alternative);

  const decision =
    pValue < alpha
      ? "Нулевая гипотеза отвергается."
      : "Нет оснований отвергнуть нулевую гипотезу.";

  const conclusion =
    pValue < alpha
      ? `При уровне значимости α = ${alpha} есть статистические основания считать, что ${getAlternativeText(
          alternative
        )}.`
      : `При уровне значимости α = ${alpha} статистических оснований считать, что ${getAlternativeText(
          alternative
        )}, нет.`;

  return createCalculationResult([
    {
      type: "table",
      title: "Результаты Z-теста для одной доли",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Количество успехов", Значение: successes },
        { Показатель: "Размер выборки", Значение: sampleSize },
        {
          Показатель: "Учитываемые значения",
          Значение: successValues.length > 0 ? successValues.join(", ") : "—"
        },
        {
          Показатель: "Наблюдаемая доля",
          Значение: Number(observedProportion.toFixed(4))
        },
        {
          Показатель: "Проверяемая доля",
          Значение: hypothesizedProportion
        },
        {
          Показатель: "Z-статистика",
          Значение: Number(z.toFixed(4))
        },
        {
          Показатель: "p-value",
          Значение: Number(pValue.toFixed(6))
        },
        {
          Показатель: "α",
          Значение: alpha
        }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content: "z = (p̂ - p₀) / sqrt(p₀(1 - p₀) / n)"
    },
    {
      type: "text",
      title: "Вывод",
      content: `${decision} ${conclusion}`
    }
  ]);
}
