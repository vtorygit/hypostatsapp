import type { AnalysisResult } from "../../types/results";
import {
  downloadCsv,
  downloadXlsx,
  copyText,
  downloadImage
} from "../../lib/exports";

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
          const actions = block.actions ?? ["downloadCsv", "addToReport"];
          const exportRows = block.exportRows ?? block.rows;
          const baseFileName =
            block.downloadFileName ?? block.title.replaceAll(" ", "_");

          return (
            <div key={index} className="result-block">
              <div className="result-block-header">
                <h3>{block.title}</h3>
                <div className="result-actions">
                  {actions.includes("downloadCsv") && (
                    <button
                      className="small-button"
                      onClick={() =>
                        downloadCsv(exportRows, block.columns, `${baseFileName}.csv`)
                      }
                    >
                      Скачать CSV
                    </button>
                  )}
                  {actions.includes("downloadXlsx") && (
                    <button
                      className="small-button"
                      onClick={() =>
                        downloadXlsx(exportRows, block.columns, `${baseFileName}.xlsx`)
                      }
                    >
                      Скачать XLSX
                    </button>
                  )}
                  {actions.includes("addToReport") && (
                    <button className="small-button" disabled title="Будет доступно в генераторе отчётов">
                      В отчёт
                    </button>
                  )}
                </div>
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
          const actions = block.actions ?? ["downloadPng", "addToReport"];

          return (
            <div key={index} className="result-block">
              <div className="result-block-header">
                <h3>{block.title}</h3>
                <div className="result-actions">
                  {actions.includes("downloadPng") && (
                    <button
                      className="small-button"
                      onClick={() => void downloadImage(block.src, block.fileName ?? "result.png")}
                    >
                      Скачать PNG
                    </button>
                  )}
                  {actions.includes("addToReport") && (
                    <button className="small-button" disabled title="Будет доступно в генераторе отчётов">
                      В отчёт
                    </button>
                  )}
                </div>
              </div>
              <img className="result-image" src={block.src} alt={block.alt} />
            </div>
          );
        }

        if (block.type === "formula") {
          const actions = block.actions ?? ["copy", "addToReport"];

          return (
            <div key={index} className="result-block">
              <div className="result-block-header">
                <h3>{block.title}</h3>
                <div className="result-actions">
                  {actions.includes("copy") && (
                    <button className="small-button" onClick={() => copyText(block.content)}>
                      Скопировать
                    </button>
                  )}
                  {actions.includes("addToReport") && (
                    <button className="small-button" disabled title="Будет доступно в генераторе отчётов">
                      В отчёт
                    </button>
                  )}
                </div>
              </div>

              <pre className="formula-box">{block.content}</pre>
            </div>
          );
        }

        const actions = block.actions ?? ["copy", "addToReport"];

        return (
          <div key={index} className="result-block">
            <div className="result-block-header">
              <h3>{block.title}</h3>
              <div className="result-actions">
                {actions.includes("copy") && (
                  <button className="small-button" onClick={() => copyText(block.content)}>
                    Скопировать
                  </button>
                )}
                {actions.includes("addToReport") && (
                  <button className="small-button" disabled title="Будет доступно в генераторе отчётов">
                    В отчёт
                  </button>
                )}
              </div>
            </div>

            <p>{block.content}</p>
          </div>
        );
      })}
    </div>
  );
}
