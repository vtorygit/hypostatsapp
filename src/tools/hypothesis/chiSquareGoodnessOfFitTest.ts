import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";

type ExpectedMode = "equal" | "custom";

export function runChiSquareGoodnessOfFitTest(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const column = String(settings.column);
  const alpha = Number(settings.alpha);
  const expectedMode = settings.expectedMode as ExpectedMode;
  const customExpectedRaw = String(settings.customExpectedRaw ?? "");

  if (!column) {
    throw new Error("Выберите категориальную переменную.");
  }

  if (Number.isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    throw new Error("Уровень значимости α должен быть числом от 0 до 1.");
  }

  const values = dataset.rows
    .map((row) => row[column])
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map(String);

  const categories = Array.from(new Set(values));

  if (categories.length < 2) {
    throw new Error("В переменной должно быть минимум 2 категории.");
  }

  const observed = categories.map(
    (category) => values.filter((value) => value === category).length
  );

  const total = observed.reduce((sum, value) => sum + value, 0);

  let expectedProportions: number[];

  if (expectedMode === "custom") {
    expectedProportions = customExpectedRaw
      .split(",")
      .map((value) => Number(value.trim().replace(",", ".")));

    if (
      expectedProportions.length !== categories.length ||
      expectedProportions.some((value) => Number.isNaN(value) || value <= 0)
    ) {
      throw new Error(
        `Введите ${categories.length} ожидаемых долей через запятую. Например: 0.2, 0.3, 0.5`
      );
    }

    const sum = expectedProportions.reduce((acc, value) => acc + value, 0);

    if (Math.abs(sum - 1) > 0.001) {
      throw new Error("Сумма ожидаемых долей должна быть равна 1.");
    }
  } else {
    expectedProportions = categories.map(() => 1 / categories.length);
  }

  const expected = expectedProportions.map((proportion) => proportion * total);

  let chiSquare = 0;

  observed.forEach((observedValue, index) => {
    chiSquare += Math.pow(observedValue - expected[index], 2) / expected[index];
  });

  const df = categories.length - 1;
  const pValue = 1 - jStat.chisquare.cdf(chiSquare, df);

  const decision =
    pValue < alpha
      ? "Нулевая гипотеза отвергается."
      : "Нет оснований отвергнуть нулевую гипотезу.";

  const conclusion =
    pValue < alpha
      ? "Наблюдаемое распределение статистически значимо отличается от ожидаемого."
      : "Статистически значимого отличия от ожидаемого распределения не обнаружено.";

  return createCalculationResult([
    {
      type: "table",
      title: "Наблюдаемые и ожидаемые частоты",
      columns: ["Категория", "Наблюдаемая частота", "Ожидаемая доля", "Ожидаемая частота"],
      rows: categories.map((category, index) => ({
        Категория: category,
        "Наблюдаемая частота": observed[index],
        "Ожидаемая доля": Number(expectedProportions[index].toFixed(4)),
        "Ожидаемая частота": Number(expected[index].toFixed(2))
      }))
    },
    {
      type: "table",
      title: "Результаты χ²-критерия согласия",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Переменная", Значение: column },
        { Показатель: "Количество категорий", Значение: categories.length },
        { Показатель: "n", Значение: total },
        { Показатель: "χ²", Значение: Number(chiSquare.toFixed(4)) },
        { Показатель: "df", Значение: df },
        { Показатель: "p-value", Значение: Number(pValue.toFixed(6)) },
        { Показатель: "α", Значение: alpha }
      ]
    },
    {
      type: "formula",
      title: "Формула",
      content: "χ² = Σ((O - E)² / E)"
    },
    {
      type: "text",
      title: "Вывод",
      content: `${decision} ${conclusion}`
    }
  ]);
}
