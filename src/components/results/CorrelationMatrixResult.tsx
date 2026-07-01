import { useMemo, useState } from "react";
import { ResultBlocks } from "./ResultBlocks";
import type { ToolResultProps } from "../../types/tools";
import {
  calculateCorrelationMatrix,
  calculateCorrelationPValue,
  getCorrelationPairs,
  type CorrelationMethod
} from "../../tools/relationships/correlationMatrix";

function formatCoefficient(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "—";
}

function formatPValue(value: number) {
  if (!Number.isFinite(value)) {
    return "p = —";
  }

  if (value < 0.001) {
    return "p < 0.001";
  }

  return `p = ${value.toFixed(3)}`;
}

export function CorrelationMatrixResult({
  result,
  dataset,
  settings
}: ToolResultProps) {
  const [showSignificance, setShowSignificance] = useState(false);

  const columns = Array.isArray(settings.columns) ? settings.columns.map(String) : [];
  const method: CorrelationMethod = settings.method === "spearman" ? "spearman" : "pearson";
  const matrix = useMemo(
    () => dataset ? calculateCorrelationMatrix(dataset, columns, method) : [],
    [dataset, columns.join("|"), method]
  );
  const otherBlocks = result.blocks.filter((block) => block.type !== "table");

  function formatCell(value: number, rowColumn: string, column: string) {
    if (!Number.isFinite(value)) {
      return "—";
    }

    if (!showSignificance || !dataset || rowColumn === column) {
      return formatCoefficient(value);
    }

    const pairs = getCorrelationPairs(dataset, rowColumn, column);
    const pValue = calculateCorrelationPValue(value, pairs.length);

    return `${formatCoefficient(value)} (${formatPValue(pValue)})`;
  }

  return (
    <div className="content-card">
      <div className="result-header">
        <div>
          <h2>Результат</h2>
          <p>Матрица корреляций с попарным исключением пропусков.</p>
        </div>
      </div>

      <div className="result-blocks">
        <div className="result-metadata result-metadata--file">
          <div>
            <span>Имя файла</span>
            <strong>{result.metadata.source}</strong>
          </div>
        </div>

        <div className="result-block">
          <h3>Корреляционная матрица ({method === "pearson" ? "Пирсон" : "Спирмен"})</h3>

          <div className="checkbox-list checkbox-list--inline">
            <label className="checkbox-row">
              <input type="checkbox" checked={showSignificance} onChange={(event) => setShowSignificance(event.target.checked)} />
              <span>Показывать p-value</span>
            </label>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Переменная</th>
                  {columns.map((column) => <th key={column}>{column}</th>)}
                </tr>
              </thead>
              <tbody>
                {columns.map((rowColumn, rowIndex) => (
                  <tr key={rowColumn}>
                    <td>{rowColumn}</td>
                    {columns.map((column, columnIndex) => (
                      <td key={column}>
                        {formatCell(matrix[rowIndex]?.[columnIndex], rowColumn, column)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ResultBlocks result={{ ...result, blocks: otherBlocks }} metadataMode="hidden" />
      </div>
    </div>
  );
}
