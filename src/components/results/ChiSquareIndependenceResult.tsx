import { useState } from "react";
import { ResultBlocks } from "./ResultBlocks";
import type { ToolResultProps } from "../../types/tools";

function categoryValues(rows: NonNullable<ToolResultProps["dataset"]>["rows"], column: string): string[] {
  return Array.from(
    new Set(
      rows
        .map((row) => row[column])
        .filter((value) => value !== null && value !== undefined && value !== "")
        .map(String)
    )
  );
}

function tableValue(rows: Array<Record<string, string | number>>, label: string) {
  return rows.find((row) => row["Показатель"] === label)?.["Значение"] ?? "—";
}

export function ChiSquareIndependenceResult({
  result,
  dataset,
  settings
}: ToolResultProps) {
  const [showObserved, setShowObserved] = useState(true);
  const [showExpected, setShowExpected] = useState(true);
  const [showDifference, setShowDifference] = useState(true);

  const resultTable = result.blocks.find(
    (block) => block.type === "table" && block.title === "Результаты χ²-критерия независимости"
  );
  const otherBlocks = result.blocks.filter(
    (block) => block !== resultTable && block.title !== "Таблица частот"
  );

  const rowColumn = String(settings.rowColumn ?? "");
  const columnColumn = String(settings.columnColumn ?? "");

  if (!dataset || !rowColumn || !columnColumn || !resultTable || resultTable.type !== "table") {
    return (
      <div className="content-card">
        <ResultBlocks result={result} metadataMode="fileOnly" />
      </div>
    );
  }

  const rowCategories = categoryValues(dataset.rows, rowColumn);
  const columnCategories = categoryValues(dataset.rows, columnColumn);
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
  const rowTotals = observed.map((row) => row.reduce((sum, value) => sum + value, 0));
  const columnTotals = columnCategories.map((_, columnIndex) =>
    observed.reduce((sum, row) => sum + row[columnIndex], 0)
  );
  const total = rowTotals.reduce((sum, value) => sum + value, 0);
  const expected = observed.map((row, rowIndex) =>
    row.map((_, columnIndex) => (rowTotals[rowIndex] * columnTotals[columnIndex]) / total)
  );

  function formatCell(rowIndex: number, columnIndex: number) {
    const parts: string[] = [];
    const observedValue = observed[rowIndex][columnIndex];
    const expectedValue = expected[rowIndex][columnIndex];
    const difference = observedValue - expectedValue;

    if (showObserved && showExpected) {
      parts.push(`${observedValue} (${expectedValue.toFixed(2)})`);
    } else if (showObserved) {
      parts.push(String(observedValue));
    } else if (showExpected) {
      parts.push(expectedValue.toFixed(2));
    }

    if (showDifference) {
      parts.push(difference.toFixed(2));
    }

    return parts.length > 0 ? parts.join(" | ") : "—";
  }

  return (
    <div className="content-card">
      <div className="result-header">
        <div>
          <h2>Результат</h2>
          <p>Сравните наблюдаемые и ожидаемые частоты в одной таблице.</p>
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
          <h3>Таблица частот</h3>
          <div className="checkbox-list checkbox-list--inline">
            <label className="checkbox-row">
              <input type="checkbox" checked={showObserved} onChange={(event) => setShowObserved(event.target.checked)} />
              <span>Наблюдаемые</span>
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={showExpected} onChange={(event) => setShowExpected(event.target.checked)} />
              <span>Ожидаемые</span>
            </label>
            <label className="checkbox-row">
              <input type="checkbox" checked={showDifference} onChange={(event) => setShowDifference(event.target.checked)} />
              <span>Разница</span>
            </label>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{rowColumn}</th>
                  {columnCategories.map((category) => (
                    <th key={category}>{category}</th>
                  ))}
                  <th>Итого</th>
                </tr>
              </thead>
              <tbody>
                {rowCategories.map((category, rowIndex) => (
                  <tr key={category}>
                    <td>{category}</td>
                    {columnCategories.map((columnCategory, columnIndex) => (
                      <td key={columnCategory}>{formatCell(rowIndex, columnIndex)}</td>
                    ))}
                    <td>{rowTotals[rowIndex]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="result-block">
          <h3>Результаты χ²-критерия независимости</h3>
          <div className="proportion-common-grid">
            <div>
              <span>χ²</span>
              <strong>{tableValue(resultTable.rows, "χ²")}</strong>
            </div>
            <div>
              <span>df</span>
              <strong>{tableValue(resultTable.rows, "df")}</strong>
            </div>
            <div>
              <span>p-value</span>
              <strong>{tableValue(resultTable.rows, "p-value")}</strong>
            </div>
          </div>
        </div>

        <ResultBlocks result={{ ...result, blocks: otherBlocks }} metadataMode="hidden" />
      </div>
    </div>
  );
}
