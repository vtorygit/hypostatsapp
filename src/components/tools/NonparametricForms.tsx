import { useMemo, useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";

function AlphaField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="form-group"><label>Уровень значимости α</label><input type="number" min="0.001" max="0.999" step="0.001" value={value} onChange={(e) => onChange(e.target.value)} required/></div>;
}

function PairedForm({ dataset, onRun, label }: DatasetToolFormProps & { label: string }) {
  const [beforeColumn, setBefore] = useState(dataset.columns[0] ?? ""); const [afterColumn, setAfter] = useState(dataset.columns[1] ?? dataset.columns[0] ?? ""); const [alpha, setAlpha] = useState("0.05");
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun({ beforeColumn, afterColumn, alpha: +alpha }); }}>
    <div className="form-group"><label>Числовая переменная: первый замер</label><select value={beforeColumn} onChange={(e) => setBefore(e.target.value)}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <div className="form-group"><label>Числовая переменная: второй замер</label><select value={afterColumn} onChange={(e) => setAfter(e.target.value)}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <AlphaField value={alpha} onChange={setAlpha}/><button className="primary-button">{label}</button>
  </form>;
}

export function WilcoxonSignedRankForm(props: DatasetToolFormProps) { return <PairedForm {...props} label="Рассчитать критерий Уилкоксона"/>; }
export function SignTestForm(props: DatasetToolFormProps) { return <PairedForm {...props} label="Рассчитать критерий знаков"/>; }

export function MannWhitneyForm({ dataset, onRun }: DatasetToolFormProps) {
  const [valueColumn, setValue] = useState(dataset.columns[0] ?? ""); const [groupColumn, setGroup] = useState(dataset.columns[1] ?? dataset.columns[0] ?? "");
  const [group1, setGroup1] = useState(""); const [group2, setGroup2] = useState(""); const [alpha, setAlpha] = useState("0.05");
  const groups = useMemo(() => Array.from(new Set(dataset.rows.map((row) => row[groupColumn]).filter((value) => value !== null && value !== undefined && value !== "").map(String))), [dataset, groupColumn]);
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun({ valueColumn, groupColumn, group1, group2, alpha: +alpha }); }}>
    <div className="form-group"><label>Числовая переменная</label><select value={valueColumn} onChange={(e) => setValue(e.target.value)}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <div className="form-group"><label>Группирующая переменная</label><select value={groupColumn} onChange={(e) => { setGroup(e.target.value); setGroup1(""); setGroup2(""); }}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <div className="form-group"><label>Первая группа</label><select value={group1} onChange={(e) => setGroup1(e.target.value)} required><option value="">Выберите</option>{groups.map((group) => <option key={group}>{group}</option>)}</select></div>
    <div className="form-group"><label>Вторая группа</label><select value={group2} onChange={(e) => setGroup2(e.target.value)} required><option value="">Выберите</option>{groups.map((group) => <option key={group}>{group}</option>)}</select></div>
    <AlphaField value={alpha} onChange={setAlpha}/><button className="primary-button">Рассчитать критерий</button>
  </form>;
}

export function KruskalWallisForm({ dataset, onRun }: DatasetToolFormProps) {
  const [valueColumn, setValue] = useState(dataset.columns[0] ?? ""); const [groupColumn, setGroup] = useState(dataset.columns[1] ?? dataset.columns[0] ?? ""); const [alpha, setAlpha] = useState("0.05");
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun({ valueColumn, groupColumn, alpha: +alpha }); }}>
    <div className="form-group"><label>Числовая переменная</label><select value={valueColumn} onChange={(e) => setValue(e.target.value)}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <div className="form-group"><label>Группирующая переменная</label><select value={groupColumn} onChange={(e) => setGroup(e.target.value)}>{dataset.columns.map((column) => <option key={column}>{column}</option>)}</select></div>
    <AlphaField value={alpha} onChange={setAlpha}/><button className="primary-button">Рассчитать критерий</button>
  </form>;
}
