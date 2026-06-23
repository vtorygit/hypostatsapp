import { useState } from "react";
import type { Dataset } from "../../types/dataset";

type ChiSquareIndependenceFormProps = {
  dataset: Dataset;
  onRun: (settings: Record<string, unknown>) => void;
};

export function ChiSquareIndependenceForm({
  dataset,
  onRun
}: ChiSquareIndependenceFormProps) {
  const [rowColumn, setRowColumn] = useState(dataset.columns[0] ?? "");
  const [columnColumn, setColumnColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [alpha, setAlpha] = useState("0.05");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      rowColumn,
      columnColumn,
      alpha: Number(alpha)
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="rowColumn">Первая переменная</label>
        <select
          id="rowColumn"
          value={rowColumn}
          onChange={(event) => setRowColumn(event.target.value)}
        >
          {dataset.columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="columnColumn">Вторая переменная</label>
        <select
          id="columnColumn"
          value={columnColumn}
          onChange={(event) => setColumnColumn(event.target.value)}
        >
          {dataset.columns.map((column) => (
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
