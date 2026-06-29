import { ResultBlocks } from "./ResultBlocks";
import type { ToolResultProps } from "../../types/tools";

function getTableValue(
  rows: Array<Record<string, string | number>>,
  label: string
) {
  const row = rows.find((item) => item["Показатель"] === label);
  return row?.["Значение"] ?? "—";
}

export function TwoProportionsZTestResult({ result }: ToolResultProps) {
  const resultTable = result.blocks.find(
    (block) => block.type === "table" && block.title === "Результаты Z-теста для двух долей"
  );
  const otherBlocks = result.blocks.filter((block) => block !== resultTable);

  if (!resultTable || resultTable.type !== "table") {
    return (
      <div className="content-card">
        <ResultBlocks result={result} metadataMode="fileOnly" />
      </div>
    );
  }

  const rows = resultTable.rows;

  return (
    <div className="content-card">
      <div className="result-header">
        <div>
          <h2>Результат</h2>
          <p>Сравните рассчитанные доли и общие показатели Z-теста.</p>
        </div>
      </div>

      <div className="result-blocks">
        <div className="result-metadata result-metadata--file">
          <div>
            <span>Имя файла</span>
            <strong>{result.metadata.source}</strong>
          </div>
        </div>

        <div className="result-block two-proportions-result">
          <h3>Результаты Z-теста для двух долей</h3>

          <div className="proportion-result-grid">
            <div className="proportion-result-card">
              <span>Доля 1</span>
              <strong>{getTableValue(rows, "Доля в группе 1")}</strong>
              <dl>
                <div>
                  <dt>Переменная</dt>
                  <dd>{getTableValue(rows, "Переменная для доли 1")}</dd>
                </div>
                <div>
                  <dt>Категории</dt>
                  <dd>{getTableValue(rows, "Категории доли 1")}</dd>
                </div>
                <div>
                  <dt>Успехи</dt>
                  <dd>{getTableValue(rows, "Успехи в группе 1")}</dd>
                </div>
                <div>
                  <dt>Размер</dt>
                  <dd>{getTableValue(rows, "Размер группы 1")}</dd>
                </div>
              </dl>
            </div>

            <div className="proportion-result-card">
              <span>Доля 2</span>
              <strong>{getTableValue(rows, "Доля в группе 2")}</strong>
              <dl>
                <div>
                  <dt>Переменная</dt>
                  <dd>{getTableValue(rows, "Переменная для доли 2")}</dd>
                </div>
                <div>
                  <dt>Категории</dt>
                  <dd>{getTableValue(rows, "Категории доли 2")}</dd>
                </div>
                <div>
                  <dt>Успехи</dt>
                  <dd>{getTableValue(rows, "Успехи в группе 2")}</dd>
                </div>
                <div>
                  <dt>Размер</dt>
                  <dd>{getTableValue(rows, "Размер группы 2")}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="proportion-common-grid">
            <div>
              <span>Общая доля</span>
              <strong>{getTableValue(rows, "Общая доля")}</strong>
            </div>
            <div>
              <span>Z-статистика</span>
              <strong>{getTableValue(rows, "Z-статистика")}</strong>
            </div>
            <div>
              <span>p-value</span>
              <strong>{getTableValue(rows, "p-value")}</strong>
            </div>
          </div>
        </div>

        <ResultBlocks
          result={{ ...result, blocks: otherBlocks }}
          metadataMode="hidden"
        />
      </div>
    </div>
  );
}
