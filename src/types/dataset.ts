export type DatasetRow = Record<string, string | number | null>;

export type Dataset = {
  fileName: string;
  rows: DatasetRow[];
  columns: string[];
  rowCount: number;
  columnCount: number;
};