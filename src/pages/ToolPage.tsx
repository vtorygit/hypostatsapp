import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getToolById } from "../tools/registry";
import type { Dataset } from "../types/dataset";
import type { ResultBlock } from "../types/results";
import { FileUploader } from "../components/data/FileUploader";
import { DataPreview } from "../components/data/DataPreview";
import { OneProportionZTestForm } from "../components/tools/OneProportionZTestForm";
import { ResultBlocks } from "../components/results/ResultBlocks";
import { spendTokens } from "../lib/storage";

export function ToolPage() {
  const { toolId } = useParams();
  const tool = getToolById(toolId);

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [resultBlocks, setResultBlocks] = useState<ResultBlock[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stage = useMemo(() => {
    if (resultBlocks) return "result";
    if (dataset) return "settings";
    return "upload";
  }, [dataset, resultBlocks]);

  if (!tool) {
    return (
      <section className="page narrow-page">
        <h1>Инструмент не найден</h1>
        <Link to="/" className="text-link">
          Вернуться на главную
        </Link>
      </section>
    );
  }

  function handleDatasetLoaded(nextDataset: Dataset) {
    setDataset(nextDataset);
    setResultBlocks(null);
    setError(null);
  }

  function handleRun(settings: Record<string, unknown>) {
    if (!tool?.run || !dataset) {
      setError("Инструмент пока не настроен.");
      return;
    }

    const paid = spendTokens(tool.tokenCost);

    if (!paid) {
      setError("Недостаточно токенов для запуска анализа.");
      return;
    }

    try {
      const blocks = tool.run(dataset, settings);
      setResultBlocks(blocks);
      setError(null);
    } catch (runError) {
      setError(
        runError instanceof Error
          ? runError.message
          : "Не удалось выполнить анализ."
      );
    }
  }

  function handleStartAgain() {
    setDataset(null);
    setResultBlocks(null);
    setError(null);
  }

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Инструмент</p>
        <h1>{tool.title}</h1>
        <p>{tool.description}</p>
      </div>

      <div className="stage-panel">
        <div className={`stage-step ${stage === "upload" ? "active" : ""}`}>
          1. Загрузка данных
        </div>
        <div className={`stage-step ${stage === "settings" ? "active" : ""}`}>
          2. Настройка
        </div>
        <div className={`stage-step ${stage === "result" ? "active" : ""}`}>
          3. Результат
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {stage === "upload" && (
        <div className="content-card">
          <h2>Загрузите данные</h2>
          <p>
            Поддерживаются файлы CSV и XLSX. Максимальный размер — 10 МБ, до
            20 000 строк и до 100 столбцов.
          </p>

          <FileUploader onLoaded={handleDatasetLoaded} />
        </div>
      )}

      {stage === "settings" && dataset && (
        <div className="two-column-layout">
          <div className="content-card">
            <h2>Проверка файла</h2>
            <DataPreview dataset={dataset} />
          </div>

          <div className="content-card">
            <h2>Настройка анализа</h2>

            {tool.id === "one-proportion-z-test" ? (
              <OneProportionZTestForm dataset={dataset} onRun={handleRun} />
            ) : (
              <p>Форма настройки для этого инструмента появится позже.</p>
            )}
          </div>
        </div>
      )}

      {stage === "result" && resultBlocks && (
        <div className="content-card">
          <div className="result-header">
            <div>
              <h2>Результат анализа</h2>
              <p>Каждый элемент можно скопировать или скачать отдельно.</p>
            </div>

            <button className="secondary-button" onClick={handleStartAgain}>
              Новый анализ
            </button>
          </div>

          <ResultBlocks blocks={resultBlocks} />
        </div>
      )}
    </section>
  );
}  