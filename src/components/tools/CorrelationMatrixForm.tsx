import { useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";

export function CorrelationMatrixForm({ dataset, onRun }: DatasetToolFormProps) {
  const [columns, setColumns] = useState<string[]>(dataset.columns.slice(0, 2));
  const [method, setMethod] = useState("pearson");
  const toggle = (column: string) => setColumns((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]);
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun({ columns, method }); }}>
    <div className="form-group"><label>Числовые столбцы</label><div className="checkbox-list">{dataset.columns.map((column) => <label key={column}><input type="checkbox" checked={columns.includes(column)} onChange={() => toggle(column)}/>{column}</label>)}</div></div>
    <div className="form-group"><label htmlFor="matrix-method">Метод</label><select id="matrix-method" value={method} onChange={(e) => setMethod(e.target.value)}><option value="pearson">Пирсон</option><option value="spearman">Спирмен</option></select></div>
    <button className="primary-button">Рассчитать матрицу</button>
  </form>;
}
