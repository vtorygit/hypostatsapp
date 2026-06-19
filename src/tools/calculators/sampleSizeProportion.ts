import { jStat } from "jstat";
import type { ResultBlock } from "../../types/results";

export function runSampleSizeProportionCalculator(
  settings: Record<string, unknown>
): ResultBlock[] {
  const confidenceLevel = Number(settings.confidenceLevel);
  const marginOfError = Number(settings.marginOfError);
  const expectedProportionRaw = settings.expectedProportion;

  if (Number.isNaN(confidenceLevel) || confidenceLevel <= 0 || confidenceLevel >= 1) {
    throw new Error("Уровень доверия должен быть числом от 0 до 1.");
  }

  if (Number.isNaN(marginOfError) || marginOfError <= 0 || marginOfError >= 1) {
    throw new Error("Погрешность должна быть числом от 0 до 1.");
  }

  const expectedProportion =
    expectedProportionRaw === "" || expectedProportionRaw === null
      ? 0.5
      : Number(expectedProportionRaw);

  if (
    Number.isNaN(expectedProportion) ||
    expectedProportion <= 0 ||
    expectedProportion >= 1
  ) {
    throw new Error("Ожидаемая доля должна быть числом от 0 до 1.");
  }

  const alpha = 1 - confidenceLevel;
  const zCritical = jStat.normal.inv(1 - alpha / 2, 0, 1);

  const rawN =
    (Math.pow(zCritical, 2) *
      expectedProportion *
      (1 - expectedProportion)) /
    Math.pow(marginOfError, 2);

  const roundedN = Math.ceil(rawN);

  return [
    {
      type: "table",
      title: "Расчёт размера выборки для доли",
      columns: ["Показатель", "Значение"],
      rows: [
        {
          Показатель: "Уровень доверия",
          Значение: confidenceLevel
        },
        {
          Показатель: "Z-критическое",
          Значение: Number(zCritical.toFixed(4))
        },
        {
          Показатель: "Ожидаемая доля",
          Значение: expectedProportion
        },
        {
          Показатель: "Допустимая погрешность",
          Значение: marginOfError
        },
        {
          Показатель: "Расчётное n",
          Значение: Number(rawN.toFixed(2))
        },
        {
          Показатель: "Минимальный размер выборки",
          Значение: roundedN
        }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content: "n = z² · p · (1 - p) / e²"
    },
    {
      type: "text",
      title: "Вывод",
      content: `Для оценки доли с уровнем доверия ${confidenceLevel} и погрешностью не больше ${marginOfError} нужен размер выборки не менее ${roundedN}.`
    }
  ];
}
