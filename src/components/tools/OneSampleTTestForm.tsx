import { useState } from "react";
import type { Dataset } from "../../types/dataset";

type OneSampleTTestFormProps = {
  dataset: Dataset;
  onRun: (settings: Record<string, unknown>) => void;
};

type Alternative = "two-sided" | "less" | "greater";

export function OneSampleTTestForm({ dataset, onRun }: OneSampleTTestFormProps) {
  const [column, setColumn] = useState(dataset.columns[0] ?? "");
  const [mu0, setMu0] = useState("");
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      column,
      mu0: Number(mu0),
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="column">Числовой столбец</label>
        <select
          id="column"
          value={column}
          onChange={(event) => setColumn(event.target.value)}
        >
          {dataset.columns.map((columnName) => (
            <option key={columnName} value={columnName}>
              {columnName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="mu0">Проверяемое среднее μ₀</label>
        <input
          id="mu0"
          type="number"
          step="0.001"
          value={mu0}
          onChange={(event) => setMu0(event.target.value)}
          placeholder="Например, 100"
          required
        />
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

      <div className="form-group">
        <label htmlFor="alternative">Альтернативная гипотеза</label>
        <select
          id="alternative"
          value={alternative}
          onChange={(event) => setAlternative(event.target.value as Alternative)}
        >
          <option value="two-sided">μ ≠ μ₀</option>
          <option value="less">μ &lt; μ₀</option>
          <option value="greater">μ &gt; μ₀</option>
        </select>
      </div>

      <button className="primary-button" type="submit">
        Запустить анализ
      </button>
    </form>
  );
}
