import { jStat } from "jstat";
import type { ResultBlock } from "../../types/results";

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

export function runZPValueCalculator(
  settings: Record<string, unknown>
): ResultBlock[] {
  const z = Number(settings.z);
  const alpha = Number(settings.alpha);
  const alternative = settings.alternative as Alternative;

  if (Number.isNaN(z)) {
    throw new Error("Z-статистика должна быть числом.");
  }

  if (Number.isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    throw new Error("Уровень значимости α должен быть числом от 0 до 1.");
  }

  const pValue = getPValue(z, alternative);

  const decision =
    pValue < alpha
      ? "Нулевая гипотеза отвергается."
      : "Нет оснований отвергнуть нулевую гипотезу.";

  return [
    {
      type: "table",
      title: "p-value для Z-статистики",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Z-статистика", Значение: z },
        { Показатель: "Альтернатива", Значение: alternative },
        { Показатель: "p-value", Значение: Number(pValue.toFixed(6)) },
        { Показатель: "α", Значение: alpha }
      ]
    },
    {
      type: "formula",
      title: "Идея расчёта",
      content: "p-value = P(Z ≥ z_obs)"
    },
    {
      type: "text",
      title: "Вывод",
      content: decision
    }
  ];
}
