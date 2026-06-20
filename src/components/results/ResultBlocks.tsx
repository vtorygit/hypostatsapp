import type { AnalysisResult } from "../../types/results";
import { downloadCsv, copyText, downloadImage } from "../../lib/exports";

type ResultBlocksProps = {
  result: AnalysisResult;
};

export function ResultBlocks({ result }: ResultBlocksProps) {
  const { blocks, metadata } = result;

  return (
    <div className="result-blocks">
      <div className="result-metadata">
        <div>
          <span>Инструмент</span>
          <strong>{metadata.toolTitle}</strong>
        </div>
        <div>
          <span>Источник</span>
          <strong>{metadata.source}</strong>
        </div>
        <div>
          <span>Дата расчёта</span>
          <strong>{new Date(metadata.createdAt).toLocaleString("ru-RU")}</strong>
        </div>
      </div>

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
                <button className="small-button" disabled title="Будет доступно в генераторе отчётов">
                  В отчёт
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

        if (block.type === "image") {
          return (
            <div key={index} className="result-block">
              <div className="result-block-header">
                <h3>{block.title}</h3>
                <div className="result-actions">
                  <button
                    className="small-button"
                    onClick={() => void downloadImage(block.src, block.fileName ?? "result.png")}
                  >
                    Скачать PNG
                  </button>
                  <button className="small-button" disabled title="Будет доступно в генераторе отчётов">
                    В отчёт
                  </button>
                </div>
              </div>
              <img className="result-image" src={block.src} alt={block.alt} />
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
                <button className="small-button" disabled title="Будет доступно в генераторе отчётов">
                  В отчёт
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
              <button className="small-button" disabled title="Будет доступно в генераторе отчётов">
                В отчёт
              </button>
            </div>

            <p>{block.content}</p>
          </div>
        );
      })}
    </div>
  );
}
