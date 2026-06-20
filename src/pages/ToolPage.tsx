import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getToolById } from "../tools/registry";
import type { Dataset } from "../types/dataset";
import type { AnalysisResult, CalculationResult } from "../types/results";
import { FileUploader } from "../components/data/FileUploader";
import { DataPreview } from "../components/data/DataPreview";
import { ResultBlocks } from "../components/results/ResultBlocks";
import { spendTokens } from "../lib/storage";

export function ToolPage() {
  const { toolId } = useParams();
  const foundTool = getToolById(toolId);

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stage = useMemo(() => {
    if (result) return "result";

    if (foundTool?.inputMode === "calculator") {
      return "settings";
    }

    if (dataset) return "settings";

    return "upload";
  }, [dataset, result, foundTool?.inputMode]);

  if (!foundTool) {
    return (
      <section className="page narrow-page">
        <h1>Инструмент не найден</h1>
        <Link to="/" className="text-link">
          Вернуться на главную
        </Link>
      </section>
    );
  }

  const tool = foundTool;

  function handleDatasetLoaded(nextDataset: Dataset) {
    setDataset(nextDataset);
    setResult(null);
    setError(null);
  }

  function handleRun(settings: Record<string, unknown>) {
    const paid = spendTokens(tool.tokenCost);

    if (!paid) {
      setError("Недостаточно токенов для запуска анализа.");
      return;
    }

    try {
      let calculation: CalculationResult;

      if (tool.inputMode === "calculator") {
        calculation = tool.run(settings);
      } else {
        if (!dataset) {
          setError("Сначала загрузите данные.");
          return;
        }

        calculation = tool.run(dataset, settings);
      }

      setResult({
        ...calculation,
        metadata: {
          title: tool.title,
          description: tool.description,
          source: dataset?.fileName ?? "Параметры, введённые пользователем",
          createdAt: new Date().toISOString(),
          toolId: tool.id,
          toolTitle: tool.title
        }
      });
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
    setResult(null);
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
        {tool.inputMode === "dataset" && (
          <div className={`stage-step ${stage === "upload" ? "active" : ""}`}>
            1. Загрузка данных
          </div>
        )}

        <div className={`stage-step ${stage === "settings" ? "active" : ""}`}>
          {tool.inputMode === "dataset" ? "2. Настройка" : "1. Настройка"}
        </div>

        <div className={`stage-step ${stage === "result" ? "active" : ""}`}>
          {tool.inputMode === "dataset" ? "3. Результат" : "2. Результат"}
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {stage === "upload" && tool.inputMode === "dataset" && (
        <div className="content-card">
          <h2>Загрузите данные</h2>
          <p>
            Поддерживаются файлы CSV и XLSX. Максимальный размер — 10 МБ, до
            20 000 строк и до 100 столбцов.
          </p>

          <FileUploader onLoaded={handleDatasetLoaded} />
        </div>
      )}

      {stage === "settings" && tool.inputMode === "dataset" && dataset && (
        <div className="two-column-layout">
          <div className="content-card">
            <h2>Проверка файла</h2>
            <DataPreview dataset={dataset} />
          </div>

          <div className="content-card">
            <h2>Настройка анализа</h2>

            <tool.formComponent dataset={dataset} onRun={handleRun} />
          </div>
        </div>
      )}

      {stage === "settings" && tool.inputMode === "calculator" && (
        <div className="content-card narrow-card">
          <h2>Настройка расчёта</h2>

          <tool.formComponent onRun={handleRun} />
        </div>
      )}

      {stage === "result" && result && (
        <div className="content-card">
          <div className="result-header">
            <div>
              <h2>Результат</h2>
              <p>Каждый элемент можно скопировать или скачать отдельно.</p>
            </div>

            <button className="secondary-button" onClick={handleStartAgain}>
              Новый расчёт
            </button>
          </div>

          <ResultBlocks result={result} />
        </div>
      )}
    </section>
  );
}
