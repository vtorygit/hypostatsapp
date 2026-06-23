import { useState } from "react";
import type { Dataset } from "../../types/dataset";

type PairedSamplesTTestFormProps = {
  dataset: Dataset;
  onRun: (settings: Record<string, unknown>) => void;
};

type Alternative = "two-sided" | "less" | "greater";

export function PairedSamplesTTestForm({
  dataset,
  onRun
}: PairedSamplesTTestFormProps) {
  const [beforeColumn, setBeforeColumn] = useState(dataset.columns[0] ?? "");
  const [afterColumn, setAfterColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      beforeColumn,
      afterColumn,
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="beforeColumn">Числовая переменная: первый замер</label>
        <select
          id="beforeColumn"
          value={beforeColumn}
          onChange={(event) => setBeforeColumn(event.target.value)}
        >
          {dataset.columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="afterColumn">Числовая переменная: второй замер</label>
        <select
          id="afterColumn"
          value={afterColumn}
          onChange={(event) => setAfterColumn(event.target.value)}
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

      <div className="form-group">
        <label htmlFor="alternative">Гипотеза</label>
        <select
          id="alternative"
          value={alternative}
          onChange={(event) => setAlternative(event.target.value as Alternative)}
        >
          <option value="two-sided">μd ≠ 0</option>
          <option value="less">μd &lt; 0</option>
          <option value="greater">μd &gt; 0</option>
        </select>
      </div>

      <button className="primary-button" type="submit">
        Запустить анализ
      </button>
    </form>
  );
}
