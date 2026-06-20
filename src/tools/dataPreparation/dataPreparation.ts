import type { Dataset, DatasetRow } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";

function displayRow(row: DatasetRow, columns: string[]): Record<string, string | number> {
  return Object.fromEntries(
    columns.map((column) => [column, row[column] ?? ""])
  );
}

function isMissing(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

export function runDataPreview(dataset: Dataset): CalculationResult {
  return createCalculationResult([
    {
      type: "text",
      title: "Структура данных",
      content: `Строк: ${dataset.rowCount}. Столбцов: ${dataset.columnCount}. Столбцы: ${dataset.columns.join(", ")}.`
    },
    {
      type: "table",
      title: "Первые 10 строк",
      columns: dataset.columns,
      rows: dataset.rows.slice(0, 10).map((row) => displayRow(row, dataset.columns))
    }
  ]);
}

export function runMissingValues(dataset: Dataset): CalculationResult {
  const rows = dataset.columns.map((column) => {
    const missingCount = dataset.rows.filter((row) => isMissing(row[column])).length;
    return {
      column,
      missingCount,
      missingPercent: dataset.rowCount === 0 ? 0 : Number(((missingCount / dataset.rowCount) * 100).toFixed(2)),
      nonMissingCount: dataset.rowCount - missingCount
    };
  });
  const affected = rows.filter((row) => row.missingCount > 0).length;

  return createCalculationResult([
    {
      type: "table",
      title: "Пропуски по столбцам",
      columns: ["column", "missingCount", "missingPercent", "nonMissingCount"],
      rows
    },
    {
      type: "text",
      title: "Вывод",
      content: affected === 0
        ? "Пропуски в данных не обнаружены."
        : `Пропуски обнаружены в ${affected} из ${dataset.columnCount} столбцов.`
    }
  ]);
}

export function runDuplicatesCheck(dataset: Dataset): CalculationResult {
  const seen = new Set<string>();
  const duplicates: DatasetRow[] = [];

  dataset.rows.forEach((row) => {
    const key = JSON.stringify(dataset.columns.map((column) => row[column] ?? null));
    if (seen.has(key)) duplicates.push(row);
    else seen.add(key);
  });

  const duplicateCount = duplicates.length;
  const duplicatePercent = dataset.rowCount === 0 ? 0 : (duplicateCount / dataset.rowCount) * 100;

  return createCalculationResult([
    {
      type: "table",
      title: "Сводка по дубликатам",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Количество дубликатов", Значение: duplicateCount },
        { Показатель: "Доля дубликатов, %", Значение: Number(duplicatePercent.toFixed(2)) }
      ]
    },
    {
      type: "table",
      title: "Первые найденные дубликаты",
      columns: dataset.columns,
      rows: duplicates.slice(0, 20).map((row) => displayRow(row, dataset.columns))
    },
    {
      type: "text",
      title: "Вывод",
      content: duplicateCount === 0
        ? "Полные дубликаты строк не обнаружены."
        : `Найдено ${duplicateCount} повторных строк (${duplicatePercent.toFixed(2)}%).`
    }
  ]);
}

export function runCategoryRecode(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const column = String(settings.column ?? "");
  const mappings = (settings.mappings ?? {}) as Record<string, string>;
  if (!column || !dataset.columns.includes(column)) throw new Error("Выберите столбец.");

  const rows = dataset.rows.map((row) => {
    const original = row[column];
    const key = original === null || original === undefined ? "" : String(original);
    const replacement = mappings[key];
    return displayRow(
      { ...row, [column]: replacement !== undefined && replacement !== "" ? replacement : original },
      dataset.columns
    );
  });

  return createCalculationResult([
    {
      type: "table",
      title: `Данные после перекодировки «${column}»`,
      columns: dataset.columns,
      rows
    },
    {
      type: "text",
      title: "Вывод",
      content: "Перекодировка применена к результату. Исходный загруженный файл не изменён."
    }
  ]);
}
