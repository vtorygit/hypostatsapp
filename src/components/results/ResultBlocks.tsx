import type { ResultBlock } from "../../types/results";
import { downloadCsv, copyText } from "../../lib/exports";

type ResultBlocksProps = {
  blocks: ResultBlock[];
};

export function ResultBlocks({ blocks }: ResultBlocksProps) {
  return (
    <div className="result-blocks">
      {blocks.map((block, index) => {
        if (block.type === "table") {
          return (
            <div key={index} className="result-block">
              <div className="result-block-header">
                <h3>{block.title}</h3>
                <button
                  className="small-button"
                  onClick={() =>
                    downloadCsv(
                      block.rows,
                      block.columns,
                      `${block.title.replaceAll(" ", "_")}.csv`
                    )
                  }
                >
                  Скачать CSV
                </button>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      {block.columns.map((column) => (
                        <th key={column}>{column}</th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {block.columns.map((column) => (
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

        if (block.type === "formula") {
          return (
            <div key={index} className="result-block">
              <div className="result-block-header">
                <h3>{block.title}</h3>
                <button
                  className="small-button"
                  onClick={() => copyText(block.content)}
                >
                  Скопировать
                </button>
              </div>

              <pre className="formula-box">{block.content}</pre>
            </div>
          );
        }

        return (
          <div key={index} className="result-block">
            <div className="result-block-header">
              <h3>{block.title}</h3>
              <button
                className="small-button"
                onClick={() => copyText(block.content)}
              >
                Скопировать
              </button>
            </div>

            <p>{block.content}</p>
          </div>
        );
      })}
    </div>
  );
}