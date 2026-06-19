import type { Dataset } from "../../types/dataset";

type DataPreviewProps = {
  dataset: Dataset;
};

export function DataPreview({ dataset }: DataPreviewProps) {
  const previewRows = dataset.rows.slice(0, 10);

  return (
    <div className="data-preview">
      <div className="dataset-meta">
        <div>
          <span>Файл</span>
          <strong>{dataset.fileName}</strong>
        </div>

        <div>
          <span>Строки</span>
          <strong>{dataset.rowCount}</strong>
        </div>

        <div>
          <span>Столбцы</span>
          <strong>{dataset.columnCount}</strong>
        </div>
      </div>

      <div className="columns-box">
        <h3>Столбцы</h3>
        <div className="columns-list">
          {dataset.columns.map((column) => (
            <span key={column}>{column}</span>
          ))}
        </div>
      </div>

      <h3>Первые 10 строк</h3>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {dataset.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {previewRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {dataset.columns.map((column) => (
                  <td key={column}>{String(row[column] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}