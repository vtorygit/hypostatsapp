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
      title: "Сводка",
      content: `Набор данных содержит ${dataset.rowCount} строк и ${dataset.columnCount} столбцов.`,
      actions: []
    },
    {
      type: "table",
      title: "Структура данных",
      columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "Файл", Значение: dataset.fileName },
        { Показатель: "Строки", Значение: dataset.rowCount },
        { Показатель: "Столбцы", Значение: dataset.columnCount },
        { Показатель: "Названия столбцов", Значение: dataset.columns.join(", ") }
      ],
      actions: []
    },
    {
      type: "table",
      title: "Первые 10 строк",
      columns: dataset.columns,
      rows: dataset.rows.slice(0, 10).map((row) => displayRow(row, dataset.columns)),
      actions: []
    }
  ]);
}

type MissingValueMethod =
  | "none"
  | "value"
  | "mean"
  | "median"
  | "zero"
  | "code999"
  | "deleteRows"
  | "deleteColumn";

type MissingValueStrategy = {
  method: MissingValueMethod;
  value?: string;
};

function getMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function parseReplacement(value: string): string | number {
  const normalized = value.trim().replace(",", ".");
  const numeric = Number(normalized);
  return normalized !== "" && Number.isFinite(numeric) ? numeric : value;
}

export function runMissingValues(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const strategies = (settings.strategies ?? {}) as Record<string, MissingValueStrategy>;
  const selectedColumns = dataset.columns.filter(
    (column) => (strategies[column]?.method ?? "none") !== "none"
  );
  const processedMissingCount = selectedColumns.reduce(
    (total, column) =>
      total + dataset.rows.filter((row) => isMissing(row[column])).length,
    0
  );

  const resultColumns = dataset.columns.filter(
    (column) => strategies[column]?.method !== "deleteColumn"
  );
  const rowDeletionColumns = dataset.columns.filter(
    (column) => strategies[column]?.method === "deleteRows"
  );

  let processedRows = dataset.rows
    .filter((row) =>
      rowDeletionColumns.every((column) => !isMissing(row[column]))
    )
    .map((row) => ({ ...row }));

  resultColumns.forEach((column) => {
    const strategy = strategies[column];
    const method = strategy?.method ?? "none";

    if (method === "none" || method === "deleteRows") {
      return;
    }

    let replacement: string | number;

    if (method === "value") {
      if (!strategy.value?.trim()) {
        throw new Error(`Укажите значение для заполнения столбца «${column}».`);
      }
      replacement = parseReplacement(strategy.value);
    } else if (method === "zero") {
      replacement = 0;
    } else if (method === "code999") {
      replacement = 999;
    } else {
      const numericValues = processedRows
        .map((row) => row[column])
        .filter(
          (value): value is number =>
            typeof value === "number" && Number.isFinite(value)
        );

      if (numericValues.length === 0) {
        throw new Error(
          `Для столбца «${column}» нельзя рассчитать ${
            method === "mean" ? "среднее" : "медиану"
          }: в нём нет числовых значений.`
        );
      }

      replacement =
        method === "mean"
          ? numericValues.reduce((sum, value) => sum + value, 0) /
            numericValues.length
          : getMedian(numericValues);
    }

    processedRows = processedRows.map((row) =>
      isMissing(row[column]) ? { ...row, [column]: replacement } : row
    );
  });

  const exportRows = processedRows.map((row) => displayRow(row, resultColumns));
  const downloadFileName = `${dataset.fileName.replace(/\.[^.]+$/, "")}_без_пропусков`;

  return createCalculationResult([
    {
      type: "text",
      title: "Сводка обработки",
      content: `Было удалено ${processedMissingCount} пропусков для ${selectedColumns.length} переменных.`,
      actions: []
    },
    {
      type: "table",
      title: "Первые 10 строк обработанных данных",
      columns: resultColumns,
      rows: exportRows.slice(0, 10),
      exportRows,
      downloadFileName,
      actions: ["downloadCsv", "downloadXlsx"]
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

  let recodedCount = 0;

  const rows = dataset.rows.map((row) => {
    const original = row[column];
    const key = original === null || original === undefined ? "" : String(original);
    const replacement = mappings[key];

    if (
      replacement !== undefined &&
      replacement !== "" &&
      replacement !== key
    ) {
      recodedCount += 1;
    }

    return displayRow(
      { ...row, [column]: replacement !== undefined && replacement !== "" ? replacement : original },
      dataset.columns
    );
  });

  return createCalculationResult([
    {
      type: "text",
      title: "Сводка",
      content: `Перекодировали ${recodedCount} значений для переменной ${column}.`,
      actions: []
    },
    {
      type: "table",
      title: `Данные после перекодировки «${column}»`,
      columns: dataset.columns,
      rows,
      exportRows: rows,
      downloadFileName: `${dataset.fileName.replace(/\.[^.]+$/, "")}_перекодировано`,
      actions: ["downloadCsv", "downloadXlsx"]
    }
  ]);
}
