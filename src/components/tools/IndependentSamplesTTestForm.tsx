import { useMemo, useState } from "react";
import type { Dataset } from "../../types/dataset";

type IndependentSamplesTTestFormProps = {
  dataset: Dataset;
  onRun: (settings: Record<string, unknown>) => void;
};

type Alternative = "two-sided" | "less" | "greater";
type CompareMode = "columns" | "groups";

export function IndependentSamplesTTestForm({
  dataset,
  onRun
}: IndependentSamplesTTestFormProps) {
  const [compareMode, setCompareMode] = useState<CompareMode>("groups");
  const [firstColumn, setFirstColumn] = useState(dataset.columns[0] ?? "");
  const [secondColumn, setSecondColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [valueColumn, setValueColumn] = useState(dataset.columns[0] ?? "");
  const [groupColumn, setGroupColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
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
    );
  }, [dataset, groupColumn]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      compareMode,
      firstColumn,
      secondColumn,
      valueColumn,
      groupColumn,
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="compareMode">Что сравниваем</label>
        <select
          id="compareMode"
          value={compareMode}
          onChange={(event) => setCompareMode(event.target.value as CompareMode)}
        >
          <option value="groups">Одну числовую переменную по двум категориям</option>
          <option value="columns">Две числовые переменные</option>
        </select>
      </div>

      {compareMode === "columns" && (
        <>
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
        </>
      )}

      {compareMode === "groups" && (
        <>
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
              onChange={(event) => setGroupColumn(event.target.value)}
            >
              {dataset.columns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <p className="field-hint">
              В расчёт попадут две категории этой переменной: {groupValues.length === 2 ? groupValues.join(" и ") : "выберите переменную с двумя категориями"}.
            </p>
          </div>
        </>
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
