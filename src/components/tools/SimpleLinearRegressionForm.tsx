import { useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";

export function SimpleLinearRegressionForm({ dataset, onRun }: DatasetToolFormProps) {
  const [xColumn, setX] = useState(dataset.columns[0] ?? "");
  const [yColumn, setY] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun({ xColumn, yColumn }); }}>
    <div className="form-group"><label htmlFor="reg-x">Переменная X</label><select id="reg-x" value={xColumn} onChange={(e) => setX(e.target.value)}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <div className="form-group"><label htmlFor="reg-y">Переменная Y</label><select id="reg-y" value={yColumn} onChange={(e) => setY(e.target.value)}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <button className="primary-button">Построить модель</button>
  </form>;
}
