import { useState } from "react";
import type { ToolFormProps } from "../../types/tools";

type Alternative = "two-sided" | "less" | "greater";

const TESTS = [
  ["one-proportion-z-test", "Z-тест для одной доли"],
  ["two-proportions-z-test", "Z-тест для двух долей"],
  ["one-sample-t-test", "t-тест для одной выборки"],
  ["independent-samples-t-test", "t-тест для независимых выборок"],
  ["paired-samples-t-test", "Парный t-тест"],
  ["chi-square-independence-test", "χ²-критерий независимости"],
  ["chi-square-goodness-of-fit-test", "χ²-критерий согласия"],
  ["mann-whitney-u-test", "Критерий Манна–Уитни"],
  ["wilcoxon-signed-rank-test", "Критерий Уилкоксона"],
  ["kruskal-wallis-test", "Критерий Краскела–Уоллиса"],
  ["sign-test", "Критерий знаков"]
] as const;

function NumberField({ label, name, values, setValue }: {
  label: string;
  name: string;
  values: Record<string, string>;
  setValue: (name: string, value: string) => void;
}) {
  return <div className="form-group"><label htmlFor={`manual-${name}`}>{label}</label><input id={`manual-${name}`} type="number" step="any" value={values[name] ?? ""} onChange={(event) => setValue(name, event.target.value)} required /></div>;
}

function ValuesField({ label, name, values, setValue, placeholder = "Например: 12 15 18 21", hint = "Числа вводятся через пробел. Десятичные значения можно писать через запятую." }: {
  label: string;
  name: string;
  values: Record<string, string>;
  setValue: (name: string, value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return <div className="form-group"><label htmlFor={`manual-${name}`}>{label}</label><textarea id={`manual-${name}`} value={values[name] ?? ""} onChange={(event) => setValue(name, event.target.value)} placeholder={placeholder} required /><p className="form-hint">{hint}</p></div>;
}

export function StatisticalTestCalculatorForm({ onRun }: ToolFormProps) {
  const [testId, setTestId] = useState("one-proportion-z-test");
  const [values, setValues] = useState<Record<string, string>>({});
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");
  const setValue = (name: string, value: string) =>
    setValues((current) => ({ ...current, [name]: value }));
  const numberField = (label: string, name: string) =>
    <NumberField key={name} label={label} name={name} values={values} setValue={setValue} />;
  const valuesField = (label: string, name: string, placeholder?: string, hint?: string) =>
    <ValuesField key={name} label={label} name={name} values={values} setValue={setValue} placeholder={placeholder} hint={hint} />;
  const hasHypothesis = [
    "one-proportion-z-test",
    "two-proportions-z-test",
    "one-sample-t-test",
    "independent-samples-t-test",
    "paired-samples-t-test"
  ].includes(testId);

  return (
    <form className="tool-form" onSubmit={(event) => { event.preventDefault(); onRun({ testId, ...values, alpha: Number(alpha), alternative }); }}>
      <div className="form-group">
        <label htmlFor="manual-test">Статистический тест</label>
        <select id="manual-test" value={testId} onChange={(event) => setTestId(event.target.value)}>
          {TESTS.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
      </div>

      {testId === "one-proportion-z-test" && <>
        {numberField("Количество объектов с признаком", "successes")}
        {numberField("Размер выборки", "sampleSize")}
        {numberField("Проверяемая доля", "hypothesizedProportion")}
      </>}

      {testId === "two-proportions-z-test" && <>
        {numberField("Количество объектов с признаком: группа 1", "successes1")}
        {numberField("Размер группы 1", "sampleSize1")}
        {numberField("Количество объектов с признаком: группа 2", "successes2")}
        {numberField("Размер группы 2", "sampleSize2")}
      </>}

      {testId === "one-sample-t-test" && <>
        {valuesField("Числовая переменная", "values")}
        {numberField("Проверяемое среднее", "mu0")}
      </>}

      {(testId === "independent-samples-t-test" || testId === "mann-whitney-u-test") && <>
        {valuesField("Числовая переменная: группа 1", "group1Values")}
        {valuesField("Числовая переменная: группа 2", "group2Values")}
      </>}

      {(["paired-samples-t-test", "wilcoxon-signed-rank-test", "sign-test"].includes(testId)) && <>
        {valuesField("Числовая переменная: первый замер", "beforeValues")}
        {valuesField("Числовая переменная: второй замер", "afterValues")}
      </>}

      {testId === "chi-square-independence-test" && <>
        {valuesField("Первая переменная", "category1Values", "Например: да; нет; да; да", "Категории вводятся через точку с запятой.")}
        {valuesField("Вторая переменная", "category2Values", "Например: группа A; группа B; группа A; группа B", "Введите столько же наблюдений в том же порядке.")}
      </>}

      {testId === "chi-square-goodness-of-fit-test" && <>
        {valuesField("Наблюдаемые частоты", "observedCounts", "Например: 25 40 35")}
        {valuesField("Ожидаемые доли", "expectedProportions", "Например: 0,25 0,5 0,25")}
      </>}

      {testId === "kruskal-wallis-test" && <div className="form-group">
        <label htmlFor="manual-groupedValues">Числовая переменная по группам</label>
        <textarea id="manual-groupedValues" value={values.groupedValues ?? ""} onChange={(event) => setValue("groupedValues", event.target.value)} placeholder={"Группа A: 12 15 18\nГруппа B: 10 14 17\nГруппа C: 20 22 25"} required />
        <p className="form-hint">Каждая группа вводится с новой строки.</p>
      </div>}

      <div className="form-group"><label htmlFor="manual-alpha">Уровень значимости α</label><input id="manual-alpha" type="number" min="0.001" max="0.999" step="0.001" value={alpha} onChange={(event) => setAlpha(event.target.value)} required /></div>

      {hasHypothesis && <div className="form-group"><label htmlFor="manual-alternative">Гипотеза</label><select id="manual-alternative" value={alternative} onChange={(event) => setAlternative(event.target.value as Alternative)}><option value="two-sided">Двусторонняя</option><option value="less">Левосторонняя</option><option value="greater">Правосторонняя</option></select></div>}

      <button className="primary-button" type="submit">Рассчитать</button>
    </form>
  );
}
