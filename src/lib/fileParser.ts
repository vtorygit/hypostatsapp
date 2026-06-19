import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { Dataset, DatasetRow } from "../types/dataset";

const MAX_FILE_SIZE_MB = 10;
const MAX_ROWS = 20000;
const MAX_COLUMNS = 100;

function validateDataset(dataset: Dataset): Dataset {
  if (dataset.rowCount > MAX_ROWS) {
    throw new Error(
      `Слишком много строк: ${dataset.rowCount}. Максимум для браузерной версии — ${MAX_ROWS}.`
    );
  }

  if (dataset.columnCount > MAX_COLUMNS) {
    throw new Error(
      `Слишком много столбцов: ${dataset.columnCount}. Максимум для браузерной версии — ${MAX_COLUMNS}.`
    );
  }

  return dataset;
}

function normalizeRows(rows: DatasetRow[]): DatasetRow[] {
  return rows.map((row) => {
    const normalized: DatasetRow = {};

    Object.entries(row).forEach(([key, value]) => {
      if (value === "") {
        normalized[key] = null;
        return;
      }

      if (typeof value === "string") {
        const numericCandidate = value.replace(",", ".");
        const numberValue = Number(numericCandidate);

        normalized[key] =
          numericCandidate.trim() !== "" && !Number.isNaN(numberValue)
            ? numberValue
            : value;
        return;
      }

      normalized[key] = value;
    });

    return normalized;
  });
}

function buildDataset(fileName: string, rawRows: DatasetRow[]): Dataset {
  const rows = normalizeRows(rawRows).filter((row) =>
    Object.values(row).some((value) => value !== null && value !== "")
  );

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return validateDataset({
    fileName,
    rows,
    columns,
    rowCount: rows.length,
    columnCount: columns.length
  });
}

export async function parseFile(file: File): Promise<Dataset> {
  const fileSizeMb = file.size / 1024 / 1024;

  if (fileSizeMb > MAX_FILE_SIZE_MB) {
    throw new Error(
      `Файл слишком большой: ${fileSizeMb.toFixed(
        1
      )} МБ. Максимальный размер — ${MAX_FILE_SIZE_MB} МБ.`
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    return parseCsv(file);
  }

  if (extension === "xlsx" || extension === "xls") {
    return parseXlsx(file);
  }

  throw new Error("Поддерживаются только файлы CSV и XLSX.");
}

function parseCsv(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<DatasetRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          reject(new Error("Не удалось прочитать CSV-файл."));
          return;
        }

        resolve(buildDataset(file.name, result.data));
      },
      error: () => {
        reject(new Error("Не удалось прочитать CSV-файл."));
      }
    });
  });
}

async function parseXlsx(file: File): Promise<Dataset> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    throw new Error("В Excel-файле не найдено листов.");
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<DatasetRow>(sheet, {
    defval: null
  });

  return buildDataset(file.name, rows);
}