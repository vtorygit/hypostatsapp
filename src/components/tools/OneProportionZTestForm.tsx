import { useMemo, useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";

type Alternative = "two-sided" | "less" | "greater";

export function OneProportionZTestForm({
  dataset,
  onRun
}: DatasetToolFormProps) {
  const [column, setColumn] = useState(dataset.columns[0] ?? "");
  const [successValue, setSuccessValue] = useState("");
  const [hypothesizedProportion, setHypothesizedProportion] = useState("0.5");
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");

  const uniqueValues = useMemo(() => {
    const values = dataset.rows
      .map((row) => row[column])
      .filter((value) => value !== null && value !== undefined && value !== "")
      .map(String);
    return Array.from(new Set(values)).slice(0, 50);
  }, [dataset, column]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const eligibleRows = dataset.rows.filter(
      (row) => row[column] !== null && row[column] !== undefined && row[column] !== ""
    );

    onRun({
      successes: eligibleRows.filter(
        (row) => String(row[column]) === successValue
      ).length,
      sampleSize: eligibleRows.length,
      hypothesizedProportion: Number(hypothesizedProportion),
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="column">Выберите переменную</label>
        <select
          id="column"
          value={column}
          onChange={(event) => {
            setColumn(event.target.value);
            setSuccessValue("");
          }}
        >
          {dataset.columns.map((columnName) => (
            <option key={columnName} value={columnName}>{columnName}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="successValue">Выберите значение признака</label>
        <select id="successValue" value={successValue} onChange={(event) => setSuccessValue(event.target.value)} required>
          <option value="">Выберите значение</option>
          {uniqueValues.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="hypothesizedProportion">Проверяемая доля</label>
        <input id="hypothesizedProportion" type="number" min="0.001" max="0.999" step="0.001" value={hypothesizedProportion} onChange={(event) => setHypothesizedProportion(event.target.value)} placeholder="Введите значение доли" required />
      </div>

      <div className="form-group">
        <label htmlFor="alpha">Уровень значимости α</label>
        <input id="alpha" type="number" min="0.001" max="0.999" step="0.001" value={alpha} onChange={(event) => setAlpha(event.target.value)} required />
      </div>

      <div className="form-group">
        <label htmlFor="alternative">Гипотеза</label>
        <select id="alternative" value={alternative} onChange={(event) => setAlternative(event.target.value as Alternative)}>
          <option value="two-sided">p ≠ p₀</option>
          <option value="less">p &lt; p₀</option>
          <option value="greater">p &gt; p₀</option>
        </select>
      </div>

      <button className="primary-button" type="submit">Запустить анализ</button>
    </form>
  );
}
