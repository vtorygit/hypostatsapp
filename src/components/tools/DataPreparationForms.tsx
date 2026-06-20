import { useMemo, useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";

export function DataPreviewForm({ onRun }: DatasetToolFormProps) {
  return <button className="primary-button" onClick={() => onRun({})}>Показать данные</button>;
}

export function MissingValuesForm({ onRun }: DatasetToolFormProps) {
  return <button className="primary-button" onClick={() => onRun({})}>Найти пропуски</button>;
}

export function DuplicatesCheckForm({ onRun }: DatasetToolFormProps) {
  return <button className="primary-button" onClick={() => onRun({})}>Найти дубликаты</button>;
}

export function CategoryRecodeForm({ dataset, onRun }: DatasetToolFormProps) {
  const [column, setColumn] = useState(dataset.columns[0] ?? "");
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const values = useMemo(
    () => Array.from(new Set(dataset.rows.map((row) => String(row[column] ?? "")))),
    [dataset, column]
  );

  return (
    <form className="tool-form" onSubmit={(event) => { event.preventDefault(); onRun({ column, mappings }); }}>
      <div className="form-group">
        <label htmlFor="recode-column">Категориальный столбец</label>
        <select id="recode-column" value={column} onChange={(event) => { setColumn(event.target.value); setMappings({}); }}>
          {dataset.columns.map((name) => <option key={name}>{name}</option>)}
        </select>
      </div>
      <div className="recode-list">
        {values.map((value) => (
          <div className="recode-row" key={value}>
            <span>{value || "(пропуск)"}</span>
            <input
              aria-label={`Новое значение для ${value}`}
              value={mappings[value] ?? ""}
              placeholder="Оставить без изменений"
              onChange={(event) => setMappings((current) => ({ ...current, [value]: event.target.value }))}
            />
          </div>
        ))}
      </div>
      <button className="primary-button" type="submit">Перекодировать</button>
    </form>
  );
}
