import { useMemo, useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";

type CompareMode = "groups" | "columns";

function AlphaField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="form-group">
      <label>Уровень значимости α</label>
      <input type="number" min="0.001" max="0.999" step="0.001" value={value} onChange={(event) => onChange(event.target.value)} required />
    </div>
  );
}

function PairedForm({ dataset, onRun, label }: DatasetToolFormProps & { label: string }) {
  const [firstColumn, setFirstColumn] = useState(dataset.columns[0] ?? "");
  const [secondColumn, setSecondColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [alpha, setAlpha] = useState("0.05");

  return (
    <form className="tool-form" onSubmit={(event) => {
      event.preventDefault();
      onRun({ beforeColumn: firstColumn, afterColumn: secondColumn, alpha: +alpha });
    }}>
      <div className="form-group">
        <label>Переменная 1</label>
        <select value={firstColumn} onChange={(event) => setFirstColumn(event.target.value)}>
          {dataset.columns.map((column) => <option key={column}>{column}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Переменная 2</label>
        <select value={secondColumn} onChange={(event) => setSecondColumn(event.target.value)}>
          {dataset.columns.map((column) => <option key={column}>{column}</option>)}
        </select>
      </div>
      <AlphaField value={alpha} onChange={setAlpha} />
      <button className="primary-button">{label}</button>
    </form>
  );
}

export function WilcoxonSignedRankForm(props: DatasetToolFormProps) {
  return <PairedForm {...props} label="Рассчитать критерий Уилкоксона" />;
}

export function SignTestForm(props: DatasetToolFormProps) {
  return <PairedForm {...props} label="Рассчитать критерий знаков" />;
}

export function MannWhitneyForm({ dataset, onRun }: DatasetToolFormProps) {
  const [compareMode, setCompareMode] = useState<CompareMode>("groups");
  const [firstColumn, setFirstColumn] = useState(dataset.columns[0] ?? "");
  const [secondColumn, setSecondColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [valueColumn, setValueColumn] = useState(dataset.columns[0] ?? "");
  const [groupColumn, setGroupColumn] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [alpha, setAlpha] = useState("0.05");

  const groups = useMemo(
    () =>
      Array.from(
        new Set(
          dataset.rows
            .map((row) => row[groupColumn])
            .filter((value) => value !== null && value !== undefined && value !== "")
            .map(String)
        )
      ),
    [dataset, groupColumn]
  );

  return (
    <form className="tool-form" onSubmit={(event) => {
      event.preventDefault();
      onRun({ compareMode, firstColumn, secondColumn, valueColumn, groupColumn, alpha: +alpha });
    }}>
      <div className="form-group">
        <label>Что сравниваем</label>
        <select value={compareMode} onChange={(event) => setCompareMode(event.target.value as CompareMode)}>
          <option value="groups">Одну числовую переменную по двум категориям</option>
          <option value="columns">Две числовые переменные</option>
        </select>
      </div>

      {compareMode === "columns" && (
        <>
          <div className="form-group">
            <label>Переменная 1</label>
            <select value={firstColumn} onChange={(event) => setFirstColumn(event.target.value)}>
              {dataset.columns.map((column) => <option key={column}>{column}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Переменная 2</label>
            <select value={secondColumn} onChange={(event) => setSecondColumn(event.target.value)}>
              {dataset.columns.map((column) => <option key={column}>{column}</option>)}
            </select>
          </div>
        </>
      )}

      {compareMode === "groups" && (
        <>
          <div className="form-group">
            <label>Числовая переменная</label>
            <select value={valueColumn} onChange={(event) => setValueColumn(event.target.value)}>
              {dataset.columns.map((column) => <option key={column}>{column}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Группирующая переменная</label>
            <select value={groupColumn} onChange={(event) => setGroupColumn(event.target.value)}>
              {dataset.columns.map((column) => <option key={column}>{column}</option>)}
            </select>
            <p className="field-hint">
              В расчёт попадут две категории этой переменной: {groups.length === 2 ? groups.join(" и ") : "выберите переменную с двумя категориями"}.
            </p>
          </div>
        </>
      )}

      <AlphaField value={alpha} onChange={setAlpha} />
      <button className="primary-button">Рассчитать критерий</button>
    </form>
  );
}

export function KruskalWallisForm({ dataset, onRun }: DatasetToolFormProps) {
  const [valueColumn, setValue] = useState(dataset.columns[0] ?? "");
  const [groupColumn, setGroup] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [alpha, setAlpha] = useState("0.05");

  return (
    <form className="tool-form" onSubmit={(event) => {
      event.preventDefault();
      onRun({ valueColumn, groupColumn, alpha: +alpha });
    }}>
      <div className="form-group">
        <label>Числовая переменная</label>
        <select value={valueColumn} onChange={(event) => setValue(event.target.value)}>
          {dataset.columns.map((column) => <option key={column}>{column}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Группирующая переменная</label>
        <select value={groupColumn} onChange={(event) => setGroup(event.target.value)}>
          {dataset.columns.map((column) => <option key={column}>{column}</option>)}
        </select>
      </div>
      <AlphaField value={alpha} onChange={setAlpha} />
      <button className="primary-button">Рассчитать критерий</button>
    </form>
  );
}
