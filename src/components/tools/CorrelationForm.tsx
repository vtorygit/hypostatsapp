import { useState } from "react";
import type { Dataset } from "../../types/dataset";
import { inferColumnKind } from "../../lib/columnTypes";

type CorrelationFormProps = {
  dataset: Dataset;
  onRun: (settings: Record<string, unknown>) => void;
};

export function CorrelationForm({ dataset, onRun }: CorrelationFormProps) {
  const numericColumns = dataset.columns.filter(
    (column) => inferColumnKind(dataset, column) === "numeric"
  );
  const [xColumn, setXColumn] = useState(numericColumns[0] ?? "");
  const [yColumn, setYColumn] = useState(numericColumns[1] ?? numericColumns[0] ?? "");
  const [alpha, setAlpha] = useState("0.05");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      xColumn,
      yColumn,
      alpha: Number(alpha)
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="xColumn">Переменная X</label>
        <select
          id="xColumn"
          value={xColumn}
          onChange={(event) => setXColumn(event.target.value)}
        >
          {numericColumns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="yColumn">Переменная Y</label>
        <select
          id="yColumn"
          value={yColumn}
          onChange={(event) => setYColumn(event.target.value)}
        >
          {numericColumns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>

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
