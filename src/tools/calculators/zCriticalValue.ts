import { jStat } from "jstat";
import { createCalculationResult, type CalculationResult } from "../../types/results";

type TailType = "two-sided" | "left" | "right";

export function runZCriticalValueCalculator(
  settings: Record<string, unknown>
): CalculationResult {
  const alpha = Number(settings.alpha);
  const tailType = settings.tailType as TailType;

  if (Number.isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    throw new Error("Уровень значимости α должен быть числом от 0 до 1.");
  }

  let criticalValue: number;
  let interpretation: string;

  if (tailType === "left") {
    criticalValue = jStat.normal.inv(alpha, 0, 1);
    interpretation = `Для левостороннего теста критическая область находится левее ${criticalValue.toFixed(4)}.`;
  } else if (tailType === "right") {
    criticalValue = jStat.normal.inv(1 - alpha, 0, 1);
    interpretation = `Для правостороннего теста критическая область находится правее ${criticalValue.toFixed(4)}.`;
  } else {
    criticalValue = jStat.normal.inv(1 - alpha / 2, 0, 1);
    interpretation = `Для двустороннего теста критические значения равны ±${criticalValue.toFixed(4)}.`;
  }

  return createCalculationResult([
    {
      type: "table",
      title: "Критическое значение Z",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "α", Значение: alpha },
        { Показатель: "Тип альтернативы", Значение: tailType },
        {
          Показатель: "Критическое значение",
          Значение: Number(criticalValue.toFixed(4))
        }
      ]
    },
    {
      type: "formula",
      title: "Идея расчёта",
      content: "z_crit = Φ⁻¹(1 - α)"
    },
    {
      type: "text",
      title: "Вывод",
      content: interpretation
    }
  ]);
}
