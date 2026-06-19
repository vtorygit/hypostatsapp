import { useMemo, useState } from "react";
import type { Dataset } from "../../types/dataset";

type OneProportionZTestFormProps = {
  dataset: Dataset;
  onRun: (settings: Record<string, unknown>) => void;
};

type Alternative = "two-sided" | "less" | "greater";

export function OneProportionZTestForm({
  dataset,
  onRun
}: OneProportionZTestFormProps) {
  const [mode, setMode] = useState<"manual" | "column">("manual");
  const [successes, setSuccesses] = useState("");
  const [sampleSize, setSampleSize] = useState("");
  const [column, setColumn] = useState(dataset.columns[0] ?? "");
  const [successValue, setSuccessValue] = useState("");
  const [hypothesizedProportion, setHypothesizedProportion] = useState("0.5");
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");

  const uniqueValues = useMemo(() => {
    if (!column) {
      return [];
    }

    const values = dataset.rows
      .map((row) => row[column])
      .filter((value) => value !== null && value !== undefined)
      .map(String);

    return Array.from(new Set(values)).slice(0, 50);
  }, [dataset, column]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "manual") {
      onRun({
        successes: Number(successes),
        sampleSize: Number(sampleSize),
        hypothesizedProportion: Number(hypothesizedProportion),
        alpha: Number(alpha),
        alternative
      });

      return;
    }

    const calculatedSuccesses = dataset.rows.filter(
      (row) => String(row[column]) === successValue
    ).length;

    const calculatedSampleSize = dataset.rows.filter(
      (row) => row[column] !== null && row[column] !== undefined && row[column] !== ""
    ).length;

    onRun({
      successes: calculatedSuccesses,
      sampleSize: calculatedSampleSize,
      hypothesizedProportion: Number(hypothesizedProportion),
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Как задать данные?</label>

        <div className="segmented-control">
          <button
            type="button"
            className={mode === "manual" ? "active" : ""}
            onClick={() => setMode("manual")}
          >
            Ввести числа
          </button>

          <button
            type="button"
            className={mode === "column" ? "active" : ""}
            onClick={() => setMode("column")}
          >
            Посчитать по столбцу
          </button>
        </div>
      </div>

      {mode === "manual" ? (
        <>
          <div className="form-group">
            <label htmlFor="successes">Количество объектов с признаком</label>
            <input
              id="successes"
              type="number"
              min="0"
              value={successes}
              onChange={(event) => setSuccesses(event.target.value)}
              placeholder="Например, 220"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sampleSize">Размер выборки</label>
            <input
              id="sampleSize"
              type="number"
              min="1"
              value={sampleSize}
              onChange={(event) => setSampleSize(event.target.value)}
              placeholder="Например, 400"
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="column">Столбец с бинарным признаком</label>
            <select
              id="column"
              value={column}
              onChange={(event) => {
                setColumn(event.target.value);
                setSuccessValue("");
              }}
            >
              {dataset.columns.map((columnName) => (
                <option key={columnName} value={columnName}>
                  {columnName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="successValue">Какое значение считать признаком?</label>
            <select
              id="successValue"
              value={successValue}
              onChange={(event) => setSuccessValue(event.target.value)}
              required
            >
              <option value="">Выберите значение</option>
              {uniqueValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="form-group">
        <label htmlFor="hypothesizedProportion">Проверяемая доля p₀</label>
        <input
          id="hypothesizedProportion"
          type="number"
          step="0.001"
          min="0.001"
          max="0.999"
          value={hypothesizedProportion}
          onChange={(event) => setHypothesizedProportion(event.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="alpha">Уровень значимости α</label>
        <input
          id="alpha"
          type="number"
          step="0.001"
          min="0.001"
          max="0.999"
          value={alpha}
          onChange={(event) => setAlpha(event.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="alternative">Альтернативная гипотеза</label>
        <select
          id="alternative"
          value={alternative}
          onChange={(event) => setAlternative(event.target.value as Alternative)}
        >
          <option value="two-sided">p ≠ p₀</option>
          <option value="less">p &lt; p₀</option>
          <option value="greater">p &gt; p₀</option>
        </select>
      </div>

      <button className="primary-button" type="submit">
        Запустить анализ
      </button>
    </form>
  );
}