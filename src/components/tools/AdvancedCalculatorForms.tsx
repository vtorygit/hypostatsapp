import { useState } from "react";
import type { ToolFormProps } from "../../types/tools";

function ConfidenceSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="form-group"><label>Уровень доверия</label><select value={value} onChange={(e) => onChange(e.target.value)}><option value="0.9">90%</option><option value="0.95">95%</option><option value="0.99">99%</option></select></div>;
}

function NumberField({ label, value, onChange, min, integer }: { label: string; value: string; onChange: (value: string) => void; min?: number; integer?: boolean }) {
  return <div className="form-group"><label>{label}</label><input type="number" step={integer ? 1 : "any"} min={min} value={value} onChange={(e) => onChange(e.target.value)} required /></div>;
}

export function SampleSizeMeanForm({ onRun }: ToolFormProps) {
  const [confidenceLevel, setConfidence] = useState("0.95"); const [standardDeviation, setSd] = useState(""); const [marginOfError, setError] = useState("");
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun({ confidenceLevel: +confidenceLevel, standardDeviation: +standardDeviation, marginOfError: +marginOfError }); }}><ConfidenceSelect value={confidenceLevel} onChange={setConfidence}/><NumberField label="Стандартное отклонение" value={standardDeviation} onChange={setSd} min={0}/><NumberField label="Допустимая погрешность" value={marginOfError} onChange={setError} min={0}/><button className="primary-button">Рассчитать</button></form>;
}

export function ConfidenceIntervalMeanForm({ onRun }: ToolFormProps) {
  const [confidenceLevel, setConfidence] = useState("0.95"); const [mean, setMean] = useState(""); const [standardDeviation, setSd] = useState(""); const [sampleSize, setN] = useState("");
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun({ confidenceLevel: +confidenceLevel, mean: +mean, standardDeviation: +standardDeviation, sampleSize: +sampleSize }); }}><NumberField label="Среднее" value={mean} onChange={setMean}/><NumberField label="Стандартное отклонение" value={standardDeviation} onChange={setSd} min={0}/><NumberField label="Размер выборки" value={sampleSize} onChange={setN} min={2} integer/><ConfidenceSelect value={confidenceLevel} onChange={setConfidence}/><button className="primary-button">Рассчитать</button></form>;
}

export function ConfidenceIntervalProportionForm({ onRun }: ToolFormProps) {
  const [confidenceLevel, setConfidence] = useState("0.95"); const [successes, setSuccesses] = useState(""); const [sampleSize, setN] = useState("");
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun({ confidenceLevel: +confidenceLevel, successes: +successes, sampleSize: +sampleSize }); }}><NumberField label="Количество успехов" value={successes} onChange={setSuccesses} min={0} integer/><NumberField label="Размер выборки" value={sampleSize} onChange={setN} min={1} integer/><ConfidenceSelect value={confidenceLevel} onChange={setConfidence}/><button className="primary-button">Рассчитать</button></form>;
}

export function CohensDForm({ onRun }: ToolFormProps) {
  const [values, setValues] = useState<Record<string, string>>({ mean1: "", mean2: "", sd1: "", sd2: "", n1: "", n2: "" });
  const field = (name: string, label: string, integer = false) => <NumberField label={label} value={values[name]} integer={integer} min={name.startsWith("sd") ? 0 : integer ? 2 : undefined} onChange={(value) => setValues((current) => ({ ...current, [name]: value }))}/>;
  return <form className="tool-form" onSubmit={(e) => { e.preventDefault(); onRun(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, +value]))); }}>{field("mean1", "Среднее группы 1")}{field("mean2", "Среднее группы 2")}{field("sd1", "SD группы 1")}{field("sd2", "SD группы 2")}{field("n1", "n группы 1", true)}{field("n2", "n группы 2", true)}<button className="primary-button">Рассчитать</button></form>;
}
