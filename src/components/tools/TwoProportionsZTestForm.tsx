import { useMemo, useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";

type Alternative = "two-sided" | "less" | "greater";

export function TwoProportionsZTestForm({ dataset, onRun }: DatasetToolFormProps) {
  const [groupColumn, setGroupColumn] = useState(dataset.columns[0] ?? "");
  const [group1Value, setGroup1Value] = useState("");
  const [group2Value, setGroup2Value] = useState("");
  const [successColumn, setSuccessColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [successValue, setSuccessValue] = useState("");
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");

  const valuesFor = (column: string) => Array.from(new Set(dataset.rows
    .map((row) => row[column])
    .filter((value) => value !== null && value !== undefined && value !== "")
    .map(String))).slice(0, 50);
  const groupValues = useMemo(() => valuesFor(groupColumn), [dataset, groupColumn]);
  const successValues = useMemo(() => valuesFor(successColumn), [dataset, successColumn]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const eligible = dataset.rows.filter(
      (row) => row[successColumn] !== null && row[successColumn] !== undefined && row[successColumn] !== ""
    );
    const group1Rows = eligible.filter((row) => String(row[groupColumn]) === group1Value);
    const group2Rows = eligible.filter((row) => String(row[groupColumn]) === group2Value);
    onRun({
      successes1: group1Rows.filter((row) => String(row[successColumn]) === successValue).length,
      sampleSize1: group1Rows.length,
      successes2: group2Rows.filter((row) => String(row[successColumn]) === successValue).length,
      sampleSize2: group2Rows.length,
      alpha: Number(alpha),
      alternative
    });
  }

  return <form className="tool-form" onSubmit={handleSubmit}>
    <div className="form-group"><label htmlFor="groupColumn">Группирующая переменная</label><select id="groupColumn" value={groupColumn} onChange={(event) => { setGroupColumn(event.target.value); setGroup1Value(""); setGroup2Value(""); }}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <div className="form-group"><label htmlFor="group1Value">Первая группа</label><select id="group1Value" value={group1Value} onChange={(event) => setGroup1Value(event.target.value)} required><option value="">Выберите значение</option>{groupValues.map((value) => <option key={value}>{value}</option>)}</select></div>
    <div className="form-group"><label htmlFor="group2Value">Вторая группа</label><select id="group2Value" value={group2Value} onChange={(event) => setGroup2Value(event.target.value)} required><option value="">Выберите значение</option>{groupValues.map((value) => <option key={value}>{value}</option>)}</select></div>
    <div className="form-group"><label htmlFor="successColumn">Бинарная переменная</label><select id="successColumn" value={successColumn} onChange={(event) => { setSuccessColumn(event.target.value); setSuccessValue(""); }}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <div className="form-group"><label htmlFor="successValue">Значение признака</label><select id="successValue" value={successValue} onChange={(event) => setSuccessValue(event.target.value)} required><option value="">Выберите значение</option>{successValues.map((value) => <option key={value}>{value}</option>)}</select></div>
    <div className="form-group"><label htmlFor="alpha">Уровень значимости α</label><input id="alpha" type="number" min="0.001" max="0.999" step="0.001" value={alpha} onChange={(event) => setAlpha(event.target.value)} required /></div>
    <div className="form-group"><label htmlFor="alternative">Гипотеза</label><select id="alternative" value={alternative} onChange={(event) => setAlternative(event.target.value as Alternative)}><option value="two-sided">p₁ ≠ p₂</option><option value="less">p₁ &lt; p₂</option><option value="greater">p₁ &gt; p₂</option></select></div>
    <button className="primary-button" type="submit">Запустить анализ</button>
  </form>;
}
