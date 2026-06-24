import { useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";
import { inferColumnKind } from "../../lib/columnTypes";

export function MultipleLinearRegressionForm({ dataset, onRun }: DatasetToolFormProps) {
  const numericColumns = dataset.columns.filter(
    (column) => inferColumnKind(dataset, column) === "numeric"
  );
  const [yColumn, setYColumn] = useState(numericColumns[0] ?? "");
  const [predictorColumns, setPredictorColumns] = useState(
    dataset.columns.filter((column) => column !== (numericColumns[0] ?? "")).slice(0, 2)
  );

  function togglePredictor(column: string) {
    setPredictorColumns((current) =>
      current.includes(column)
        ? current.filter((item) => item !== column)
        : [...current, column]
    );
  }

  return (
    <form className="tool-form" onSubmit={(event) => { event.preventDefault(); onRun({ yColumn, predictorColumns }); }}>
      <div className="form-group">
        <label htmlFor="reg-y">Зависимая переменная</label>
        <select id="reg-y" value={yColumn} onChange={(event) => {
          const next = event.target.value;
          setYColumn(next);
          setPredictorColumns((current) => current.filter((column) => column !== next));
        }}>
          {numericColumns.map((column) => <option key={column}>{column}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>Предикторы — выберите один или несколько</label>
        <div className="checkbox-list regression-predictors">
          {dataset.columns.filter((column) => column !== yColumn).map((column) => (
            <label key={column}>
              <input type="checkbox" checked={predictorColumns.includes(column)} onChange={() => togglePredictor(column)} />
              <span>{column} <small>({inferColumnKind(dataset, column) === "numeric" ? "числовая" : "категориальная"})</small></span>
            </label>
          ))}
        </div>
      </div>

      <button className="primary-button" type="submit">Построить модель</button>
    </form>
  );
}
