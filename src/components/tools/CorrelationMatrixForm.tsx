import { useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";
import { inferColumnKind } from "../../lib/columnTypes";

type CorrelationMatrixFormProps = DatasetToolFormProps & {
  submitLabel?: string;
};

export function CorrelationMatrixForm({ dataset, onRun, submitLabel = "Рассчитать матрицу" }: CorrelationMatrixFormProps) {
  const numericColumns = dataset.columns.filter(
    (column) => inferColumnKind(dataset, column) === "numeric"
  );
  const [columns, setColumns] = useState<string[]>(numericColumns.slice(0, 2));
  const [method, setMethod] = useState("pearson");
  const toggle = (column: string) => setColumns((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]);
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun({ columns, method }); }}>
    <div className="form-group"><label>Числовые столбцы</label><div className="checkbox-list">{numericColumns.map((column) => <label key={column}><input type="checkbox" checked={columns.includes(column)} onChange={() => toggle(column)}/>{column}</label>)}</div></div>
    <div className="form-group"><label htmlFor="matrix-method">Метод</label><select id="matrix-method" value={method} onChange={(e) => setMethod(e.target.value)}><option value="pearson">Пирсон</option><option value="spearman">Спирмен</option></select></div>
    <button className="primary-button">{submitLabel}</button>
  </form>;
}

export function CorrelationHeatmapForm(props: DatasetToolFormProps) {
  return <CorrelationMatrixForm {...props} submitLabel="Построить тепловую диаграмму" />;
}
