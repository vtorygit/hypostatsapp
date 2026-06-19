import { useMemo, useState } from "react";
import type { Dataset } from "../../types/dataset";

type ChiSquareGoodnessOfFitFormProps = {
  dataset: Dataset;
  onRun: (settings: Record<string, unknown>) => void;
};

type ExpectedMode = "equal" | "custom";

export function ChiSquareGoodnessOfFitForm({
  dataset,
  onRun
}: ChiSquareGoodnessOfFitFormProps) {
  const [column, setColumn] = useState(dataset.columns[0] ?? "");
  const [alpha, setAlpha] = useState("0.05");
  const [expectedMode, setExpectedMode] = useState<ExpectedMode>("equal");
  const [customExpectedRaw, setCustomExpectedRaw] = useState("");

  const categories = useMemo(() => {
    if (!column) {
      return [];
    }

    return Array.from(
      new Set(
        dataset.rows
          .map((row) => row[column])
          .filter((value) => value !== null && value !== undefined && value !== "")
          .map(String)
      )
    );
  }, [dataset, column]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      column,
      alpha: Number(alpha),
      expectedMode,
      customExpectedRaw
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="column">Категориальная переменная</label>
        <select
          id="column"
          value={column}
          onChange={(event) => {
            setColumn(event.target.value);
            setCustomExpectedRaw("");
          }}
        >
          {dataset.columns.map((columnName) => (
            <option key={columnName} value={columnName}>
              {columnName}
            </option>
          ))}
        </select>
      </div>

      <div className="columns-box">
        <h3>Категории в выбранной переменной</h3>
        <div className="columns-list">
          {categories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Ожидаемое распределение</label>

        <div className="segmented-control">
          <button
            type="button"
            className={expectedMode === "equal" ? "active" : ""}
            onClick={() => setExpectedMode("equal")}
          >
            Равные доли
          </button>

          <button
            type="button"
            className={expectedMode === "custom" ? "active" : ""}
            onClick={() => setExpectedMode("custom")}
          >
            Задать вручную
          </button>
        </div>
      </div>

      {expectedMode === "custom" && (
        <div className="form-group">
          <label htmlFor="customExpectedRaw">Ожидаемые доли через запятую</label>
          <input
            id="customExpectedRaw"
            type="text"
            value={customExpectedRaw}
            onChange={(event) => setCustomExpectedRaw(event.target.value)}
            placeholder="Например: 0.2, 0.3, 0.5"
            required
          />
          <p className="form-hint">
            Порядок долей должен совпадать с порядком категорий выше. Сумма
            должна быть равна 1.
          </p>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="alpha">Уровень значимости α</label>
        <input
          id="alpha"
          type="number"
          min="0.001"
          max="0.999"
          step="0.001"
          value={alpha}
          onChange={(event) => setAlpha(event.target.value)}
          required
        />
      </div>

      <button className="primary-button" type="submit">
        Запустить анализ
      </button>
    </form>
  );
}
