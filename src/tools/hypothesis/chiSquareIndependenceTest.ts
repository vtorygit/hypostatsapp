import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";

export function runChiSquareIndependenceTest(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const rowColumn = String(settings.rowColumn);
  const columnColumn = String(settings.columnColumn);
  const alpha = Number(settings.alpha);

  if (!rowColumn || !columnColumn) {
    throw new Error("Выберите две категориальные переменные.");
  }

  if (rowColumn === columnColumn) {
    throw new Error("Для χ² независимости нужны две разные переменные.");
  }

  if (Number.isNaN(alpha) || alpha <= 0 || alpha >= 1) {
    throw new Error("Уровень значимости α должен быть числом от 0 до 1.");
  }

  const rowCategories = Array.from(
    new Set(
      dataset.rows
        .map((row) => row[rowColumn])
        .filter((value) => value !== null && value !== undefined && value !== "")
        .map(String)
    )
  );

  const columnCategories = Array.from(
    new Set(
      dataset.rows
        .map((row) => row[columnColumn])
        .filter((value) => value !== null && value !== undefined && value !== "")
        .map(String)
    )
  );

  if (rowCategories.length < 2 || columnCategories.length < 2) {
    throw new Error("В каждой переменной должно быть минимум 2 категории.");
  }

  const observed = rowCategories.map((rowCategory) =>
    columnCategories.map(
      (columnCategory) =>
        dataset.rows.filter(
          (row) =>
            String(row[rowColumn]) === rowCategory &&
            String(row[columnColumn]) === columnCategory
        ).length
    )
  );

  const rowTotals = observed.map((row) =>
    row.reduce((sum, value) => sum + value, 0)
  );

  const columnTotals = columnCategories.map((_, columnIndex) =>
    observed.reduce((sum, row) => sum + row[columnIndex], 0)
  );

  const total = rowTotals.reduce((sum, value) => sum + value, 0);

  const expected = observed.map((row, rowIndex) =>
    row.map((_, columnIndex) => {
      return (rowTotals[rowIndex] * columnTotals[columnIndex]) / total;
    })
  );

  let chiSquare = 0;

  observed.forEach((row, rowIndex) => {
    row.forEach((observedValue, columnIndex) => {
      const expectedValue = expected[rowIndex][columnIndex];
      chiSquare += Math.pow(observedValue - expectedValue, 2) / expectedValue;
    });
  });

  const df = (rowCategories.length - 1) * (columnCategories.length - 1);
  const pValue = 1 - jStat.chisquare.cdf(chiSquare, df);

  const decision =
    pValue < alpha
      ? "Нулевая гипотеза отвергается."
      : "Нет оснований отвергнуть нулевую гипотезу.";

  const conclusion =
    pValue < alpha
      ? "Между переменными есть статистически значимая связь."
      : "Статистически значимой связи между переменными не обнаружено.";

  const frequencyRows = rowCategories.map((category, rowIndex) => {
    const row: Record<string, string | number> = {
      [rowColumn]: category
    };

    columnCategories.forEach((columnCategory, columnIndex) => {
      const observedValue = observed[rowIndex][columnIndex];
      const expectedValue = expected[rowIndex][columnIndex];
      const difference = observedValue - expectedValue;
      row[columnCategory] = `${observedValue} (${expectedValue.toFixed(2)}) | ${difference.toFixed(2)}`;
    });

    row["Итого"] = rowTotals[rowIndex];

    return row;
  });

  return createCalculationResult([
    {
      type: "table",
      title: "Таблица частот",
      columns: [rowColumn, ...columnCategories, "Итого"],
      rows: frequencyRows
    },
    {
      type: "table",
      title: "Результаты χ²-критерия независимости",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Переменная 1", Значение: rowColumn },
        { Показатель: "Переменная 2", Значение: columnColumn },
        { Показатель: "χ²", Значение: Number(chiSquare.toFixed(4)) },
        { Показатель: "df", Значение: df },
        { Показатель: "p-value", Значение: Number(pValue.toFixed(6)) }
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
