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
  const [firstColumn, setFirstColumn] = useState(dataset.columns[0] ?? "");
  const [secondColumn, setSecondColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      beforeColumn: firstColumn,
      afterColumn: secondColumn,
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="firstColumn">Переменная 1</label>
        <select
          id="firstColumn"
          value={firstColumn}
          onChange={(event) => setFirstColumn(event.target.value)}
        >
          {dataset.columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="secondColumn">Переменная 2</label>
        <select
          id="secondColumn"
          value={secondColumn}
          onChange={(event) => setSecondColumn(event.target.value)}
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
          <option value="two-sided">μ₁ ≠ μ₂</option>
          <option value="less">μ₁ &lt; μ₂</option>
          <option value="greater">μ₁ &gt; μ₂</option>
        </select>
      </div>

      <button className="primary-button" type="submit">
        Запустить анализ
      </button>
    </form>
  );
}
