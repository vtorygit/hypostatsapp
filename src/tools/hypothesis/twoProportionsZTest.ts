import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
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

function getAlternativeText(alternative: Alternative): string {
  if (alternative === "less") {
    return "доля в первой группе меньше доли во второй группе";
  }

  if (alternative === "greater") {
    return "доля в первой группе больше доли во второй группе";
  }

  return "доли в двух группах различаются";
}

export function runTwoProportionsZTest(
  _dataset: Dataset,
  settings: Record<string, unknown>
): ResultBlock[] {
  const successes1 = Number(settings.successes1);
  const sampleSize1 = Number(settings.sampleSize1);
  const successes2 = Number(settings.successes2);
  const sampleSize2 = Number(settings.sampleSize2);
  const alpha = Number(settings.alpha);
  const alternative = settings.alternative as Alternative;

  if (
    [successes1, sampleSize1, successes2, sampleSize2, alpha].some((value) =>
      Number.isNaN(value)
    )
  ) {
    throw new Error("Проверьте числовые значения.");
  }

  if (sampleSize1 <= 0 || sampleSize2 <= 0) {
    throw new Error("Размеры выборок должны быть больше 0.");
  }

  if (
    successes1 < 0 ||
    successes1 > sampleSize1 ||
    successes2 < 0 ||
    successes2 > sampleSize2
  ) {
    throw new Error("Количество успехов должно быть от 0 до размера выборки.");
  }

  if (alpha <= 0 || alpha >= 1) {
    throw new Error("Уровень значимости α должен быть числом от 0 до 1.");
  }

  const p1 = successes1 / sampleSize1;
  const p2 = successes2 / sampleSize2;

  const pooledP = (successes1 + successes2) / (sampleSize1 + sampleSize2);

  const standardError = Math.sqrt(
    pooledP * (1 - pooledP) * (1 / sampleSize1 + 1 / sampleSize2)
  );

  const z = (p1 - p2) / standardError;
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

  return [
    {
      type: "table",
      title: "Результаты Z-теста для двух долей",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Успехи в группе 1", Значение: successes1 },
        { Показатель: "Размер группы 1", Значение: sampleSize1 },
        { Показатель: "Доля в группе 1", Значение: Number(p1.toFixed(4)) },
        { Показатель: "Успехи в группе 2", Значение: successes2 },
        { Показатель: "Размер группы 2", Значение: sampleSize2 },
        { Показатель: "Доля в группе 2", Значение: Number(p2.toFixed(4)) },
        { Показатель: "Общая доля", Значение: Number(pooledP.toFixed(4)) },
        { Показатель: "Z-статистика", Значение: Number(z.toFixed(4)) },
        { Показатель: "p-value", Значение: Number(pValue.toFixed(6)) },
        { Показатель: "α", Значение: alpha }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content: "z = (p̂₁ - p̂₂) / sqrt(p̂(1 - p̂)(1/n₁ + 1/n₂))"
    },
    {
      type: "text",
      title: "Вывод",
      content: `${decision} ${conclusion}`
    }
  ];
}
