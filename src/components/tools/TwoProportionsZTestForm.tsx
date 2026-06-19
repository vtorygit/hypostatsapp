import { useMemo, useState } from "react";
import type { Dataset } from "../../types/dataset";

type TwoProportionsZTestFormProps = {
  dataset: Dataset;
  onRun: (settings: Record<string, unknown>) => void;
};

type Alternative = "two-sided" | "less" | "greater";

export function TwoProportionsZTestForm({
  dataset,
  onRun
}: TwoProportionsZTestFormProps) {
  const [mode, setMode] = useState<"manual" | "columns">("manual");

  const [successes1, setSuccesses1] = useState("");
  const [sampleSize1, setSampleSize1] = useState("");
  const [successes2, setSuccesses2] = useState("");
  const [sampleSize2, setSampleSize2] = useState("");

  const [groupColumn, setGroupColumn] = useState(dataset.columns[0] ?? "");
  const [group1Value, setGroup1Value] = useState("");
  const [group2Value, setGroup2Value] = useState("");
  const [successColumn, setSuccessColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [successValue, setSuccessValue] = useState("");

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

  const successValues = useMemo(() => {
    if (!successColumn) return [];

    return Array.from(
      new Set(
        dataset.rows
          .map((row) => row[successColumn])
          .filter((value) => value !== null && value !== undefined && value !== "")
          .map(String)
      )
    ).slice(0, 50);
  }, [dataset, successColumn]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "manual") {
      onRun({
        successes1: Number(successes1),
        sampleSize1: Number(sampleSize1),
        successes2: Number(successes2),
        sampleSize2: Number(sampleSize2),
        alpha: Number(alpha),
        alternative
      });

      return;
    }

    const group1Rows = dataset.rows.filter(
      (row) => String(row[groupColumn]) === group1Value
    );

    const group2Rows = dataset.rows.filter(
      (row) => String(row[groupColumn]) === group2Value
    );

    const calculatedSuccesses1 = group1Rows.filter(
      (row) => String(row[successColumn]) === successValue
    ).length;

    const calculatedSuccesses2 = group2Rows.filter(
      (row) => String(row[successColumn]) === successValue
    ).length;

    onRun({
      successes1: calculatedSuccesses1,
      sampleSize1: group1Rows.length,
      successes2: calculatedSuccesses2,
      sampleSize2: group2Rows.length,
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Как задать данные?</label>

        <div className="segmented-control">
          <button
            type="button"
            className={mode === "manual" ? "active" : ""}
            onClick={() => setMode("manual")}
          >
            Ввести числа
          </button>

          <button
            type="button"
            className={mode === "columns" ? "active" : ""}
            onClick={() => setMode("columns")}
          >
            Посчитать по столбцам
          </button>
        </div>
      </div>

      {mode === "manual" ? (
        <>
          <div className="form-group">
            <label htmlFor="successes1">Успехи в группе 1</label>
            <input
              id="successes1"
              type="number"
              min="0"
              value={successes1}
              onChange={(event) => setSuccesses1(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sampleSize1">Размер группы 1</label>
            <input
              id="sampleSize1"
              type="number"
              min="1"
              value={sampleSize1}
              onChange={(event) => setSampleSize1(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="successes2">Успехи в группе 2</label>
            <input
              id="successes2"
              type="number"
              min="0"
              value={successes2}
              onChange={(event) => setSuccesses2(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sampleSize2">Размер группы 2</label>
            <input
              id="sampleSize2"
              type="number"
              min="1"
              value={sampleSize2}
              onChange={(event) => setSampleSize2(event.target.value)}
              required
            />
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="groupColumn">Столбец с группами</label>
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
            <label htmlFor="group1Value">Значение первой группы</label>
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
            <label htmlFor="group2Value">Значение второй группы</label>
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
            <label htmlFor="successColumn">Столбец с признаком</label>
            <select
              id="successColumn"
              value={successColumn}
              onChange={(event) => {
                setSuccessColumn(event.target.value);
                setSuccessValue("");
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
            <label htmlFor="successValue">Какое значение считать признаком?</label>
            <select
              id="successValue"
              value={successValue}
              onChange={(event) => setSuccessValue(event.target.value)}
              required
            >
              <option value="">Выберите значение</option>
              {successValues.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
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
        <label htmlFor="alternative">Альтернативная гипотеза</label>
        <select
          id="alternative"
          value={alternative}
          onChange={(event) => setAlternative(event.target.value as Alternative)}
        >
          <option value="two-sided">p₁ ≠ p₂</option>
          <option value="less">p₁ &lt; p₂</option>
          <option value="greater">p₁ &gt; p₂</option>
        </select>
      </div>

      <button className="primary-button" type="submit">
        Запустить анализ
      </button>
    </form>
  );
}
