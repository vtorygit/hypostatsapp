import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getToolById } from "../tools/registry";
import type { Dataset } from "../types/dataset";
import type { ResultBlock } from "../types/results";
import { FileUploader } from "../components/data/FileUploader";
import { DataPreview } from "../components/data/DataPreview";
import { OneProportionZTestForm } from "../components/tools/OneProportionZTestForm";
import { TwoProportionsZTestForm } from "../components/tools/TwoProportionsZTestForm";
import { OneSampleTTestForm } from "../components/tools/OneSampleTTestForm";
import { IndependentSamplesTTestForm } from "../components/tools/IndependentSamplesTTestForm";
import { PairedSamplesTTestForm } from "../components/tools/PairedSamplesTTestForm";
import { ChiSquareIndependenceForm } from "../components/tools/ChiSquareIndependenceForm";
import { ChiSquareGoodnessOfFitForm } from "../components/tools/ChiSquareGoodnessOfFitForm";
import { CorrelationForm } from "../components/tools/CorrelationForm";
import { SampleSizeProportionForm } from "../components/tools/SampleSizeProportionForm";
import { ZCriticalValueForm } from "../components/tools/ZCriticalValueForm";
import { ZPValueForm } from "../components/tools/ZPValueForm";
import { ResultBlocks } from "../components/results/ResultBlocks";
import { spendTokens } from "../lib/storage";

export function ToolPage() {
  const { toolId } = useParams();
  const foundTool = getToolById(toolId);

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [resultBlocks, setResultBlocks] = useState<ResultBlock[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stage = useMemo(() => {
    if (resultBlocks) return "result";

    if (foundTool?.inputMode === "calculator") {
      return "settings";
    }

    if (dataset) return "settings";

    return "upload";
  }, [dataset, resultBlocks, foundTool?.inputMode]);

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
    setResultBlocks(null);
    setError(null);
  }

  function handleRun(settings: Record<string, unknown>) {
    const paid = spendTokens(tool.tokenCost);

    if (!paid) {
      setError("Недостаточно токенов для запуска анализа.");
      return;
    }

    try {
      if (tool.inputMode === "calculator") {
        if (!tool.runCalculator) {
          setError("Калькулятор пока не настроен.");
          return;
        }

        const blocks = tool.runCalculator(settings);
        setResultBlocks(blocks);
        setError(null);
        return;
      }

      if (!tool.run || !dataset) {
        setError("Инструмент пока не настроен.");
        return;
      }

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

            {tool.id === "one-proportion-z-test" && (
              <OneProportionZTestForm dataset={dataset} onRun={handleRun} />
            )}

            {tool.id === "two-proportions-z-test" && (
              <TwoProportionsZTestForm dataset={dataset} onRun={handleRun} />
            )}

            {tool.id === "one-sample-t-test" && (
              <OneSampleTTestForm dataset={dataset} onRun={handleRun} />
            )}

            {tool.id === "independent-samples-t-test" && (
              <IndependentSamplesTTestForm dataset={dataset} onRun={handleRun} />
            )}

            {tool.id === "paired-samples-t-test" && (
              <PairedSamplesTTestForm dataset={dataset} onRun={handleRun} />
            )}

            {tool.id === "chi-square-independence-test" && (
              <ChiSquareIndependenceForm dataset={dataset} onRun={handleRun} />
            )}

            {tool.id === "chi-square-goodness-of-fit-test" && (
              <ChiSquareGoodnessOfFitForm dataset={dataset} onRun={handleRun} />
            )}

            {(tool.id === "pearson-correlation" ||
              tool.id === "spearman-correlation") && (
              <CorrelationForm dataset={dataset} onRun={handleRun} />
            )}
          </div>
        </div>
      )}

      {stage === "settings" && tool.inputMode === "calculator" && (
        <div className="content-card narrow-card">
          <h2>Настройка расчёта</h2>

          {tool.id === "sample-size-proportion" && (
            <SampleSizeProportionForm onRun={handleRun} />
          )}

          {tool.id === "z-critical-value" && (
            <ZCriticalValueForm onRun={handleRun} />
          )}

          {tool.id === "z-p-value" && <ZPValueForm onRun={handleRun} />}
        </div>
      )}

      {stage === "result" && resultBlocks && (
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

          <ResultBlocks blocks={resultBlocks} />
        </div>
      )}
    </section>
  );
}
