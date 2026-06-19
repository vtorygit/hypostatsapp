import { useMemo, useState } from "react";
import type { Dataset } from "../../types/dataset";

type IndependentSamplesTTestFormProps = {
  dataset: Dataset;
  onRun: (settings: Record<string, unknown>) => void;
};

type Alternative = "two-sided" | "less" | "greater";

export function IndependentSamplesTTestForm({
  dataset,
  onRun
}: IndependentSamplesTTestFormProps) {
  const [valueColumn, setValueColumn] = useState(dataset.columns[0] ?? "");
  const [groupColumn, setGroupColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [group1Value, setGroup1Value] = useState("");
  const [group2Value, setGroup2Value] = useState("");
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");

  const groupValues = useMemo(() => {
    if (!groupColumn) return [];

    return Array.from(
      new Set(
        dataset.rows
          .map((row) => row[groupColumn])
          .filter((value) => value !== null && value !== undefined && value !== "")
          .map(String)
      )
    ).slice(0, 50);
  }, [dataset, groupColumn]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      valueColumn,
      groupColumn,
      group1Value,
      group2Value,
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="valueColumn">Числовая переменная</label>
        <select
          id="valueColumn"
          value={valueColumn}
          onChange={(event) => setValueColumn(event.target.value)}
        >
          {dataset.columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="groupColumn">Группирующая переменная</label>
        <select
          id="groupColumn"
          value={groupColumn}
          onChange={(event) => {
            setGroupColumn(event.target.value);
            setGroup1Value("");
            setGroup2Value("");
          }}
        >
          {dataset.columns.map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="group1Value">Первая группа</label>
        <select
          id="group1Value"
          value={group1Value}
          onChange={(event) => setGroup1Value(event.target.value)}
          required
        >
          <option value="">Выберите значение</option>
          {groupValues.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="group2Value">Вторая группа</label>
        <select
          id="group2Value"
          value={group2Value}
          onChange={(event) => setGroup2Value(event.target.value)}
          required
        >
          <option value="">Выберите значение</option>
          {groupValues.map((value) => (
            <option key={value} value={value}>
              {value}
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
        <label htmlFor="alternative">Альтернативная гипотеза</label>
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
