import { useEffect, useMemo, useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";

type Alternative = "two-sided" | "less" | "greater";

const MAX_CATEGORY_VALUES = 20;

type CategorySummary = {
  value: string;
  count: number;
};

type ColumnSummary = {
  name: string;
  categories: CategorySummary[];
  isLikelyContinuousNumeric: boolean;
};

function summarizeColumn(
  dataset: DatasetToolFormProps["dataset"],
  column: string
): ColumnSummary {
  const counts = new Map<string, number>();
  let numericCount = 0;
  let nonEmptyCount = 0;

  dataset.rows.forEach((row) => {
    const rawValue = row[column];

    if (rawValue === null || rawValue === undefined || rawValue === "") {
      return;
    }

    nonEmptyCount += 1;

    if (typeof rawValue === "number") {
      numericCount += 1;
    } else if (!Number.isNaN(Number(String(rawValue).replace(",", ".")))) {
      numericCount += 1;
    }

    const value = String(rawValue);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  const categories = Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value, "ru"));

  return {
    name: column,
    categories,
    isLikelyContinuousNumeric:
      nonEmptyCount > 0 &&
      numericCount / nonEmptyCount >= 0.9 &&
      categories.length > MAX_CATEGORY_VALUES
  };
}

export function OneProportionZTestForm({
  dataset,
  onRun
}: DatasetToolFormProps) {
  const [column, setColumn] = useState(dataset.columns[0] ?? "");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [hypothesizedProportion, setHypothesizedProportion] = useState("0.5");
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const columnSummaries = useMemo(
    () => dataset.columns.map((columnName) => summarizeColumn(dataset, columnName)),
    [dataset]
  );

  const selectableColumns = useMemo(
    () => columnSummaries.filter((summary) => !summary.isLikelyContinuousNumeric),
    [columnSummaries]
  );

  const activeColumnSummary = useMemo(
    () => columnSummaries.find((summary) => summary.name === column),
    [column, columnSummaries]
  );

  useEffect(() => {
    if (
      column &&
      columnSummaries.some(
        (summary) => summary.name === column && !summary.isLikelyContinuousNumeric
      )
    ) {
      return;
    }

    setColumn(selectableColumns[0]?.name ?? "");
    setSelectedValues([]);
  }, [column, columnSummaries, selectableColumns]);

  function toggleSelectedValue(value: string) {
    setSelectionError(null);
    setSelectedValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedValues.length === 0) {
      setSelectionError("Выберите хотя бы одно значение признака.");
      return;
    }

    const eligibleRows = dataset.rows.filter(
      (row) => row[column] !== null && row[column] !== undefined && row[column] !== ""
    );
    const selectedValueSet = new Set(selectedValues);

    onRun({
      successes: eligibleRows.filter(
        (row) => selectedValueSet.has(String(row[column]))
      ).length,
      sampleSize: eligibleRows.length,
      successValues: selectedValues,
      hypothesizedProportion: Number(hypothesizedProportion),
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="column">Выберите переменную</label>
        <select
          id="column"
          value={column}
          onChange={(event) => {
            setColumn(event.target.value);
            setSelectedValues([]);
            setSelectionError(null);
          }}
          disabled={selectableColumns.length === 0}
        >
          {columnSummaries.map((summary) => (
            <option
              key={summary.name}
              value={summary.name}
              disabled={summary.isLikelyContinuousNumeric}
            >
              {summary.isLikelyContinuousNumeric
                ? `${summary.name} — слишком много числовых значений`
                : summary.name}
            </option>
          ))}
        </select>
      </div>

      {selectableColumns.length === 0 && (
        <div className="error-box">
          В файле не найдено категориальных переменных для расчёта доли.
        </div>
      )}

      {activeColumnSummary && !activeColumnSummary.isLikelyContinuousNumeric && (
        <div className="form-group">
          <h3>Число наблюдений по категориям</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Значение</th>
                  <th>Количество</th>
                </tr>
              </thead>
              <tbody>
                {activeColumnSummary.categories.map((category) => (
                  <tr key={category.value}>
                    <td>{category.value}</td>
                    <td>{category.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="form-group">
        <label>Выберите значение признака</label>
        <div className="checkbox-list">
          {activeColumnSummary?.categories.map((category) => (
            <label key={category.value} className="checkbox-row">
              <input
                type="checkbox"
                checked={selectedValues.includes(category.value)}
                onChange={() => toggleSelectedValue(category.value)}
              />
              <span>{category.value}</span>
              <strong>{category.count}</strong>
            </label>
          ))}
        </div>
        {selectionError && <div className="error-box">{selectionError}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="hypothesizedProportion">С каким значением сравнивается</label>
        <p className="field-hint">Введите значение от 0 до 1.</p>
        <input id="hypothesizedProportion" type="number" min="0.001" max="0.999" step="0.001" value={hypothesizedProportion} onChange={(event) => setHypothesizedProportion(event.target.value)} placeholder="Введите значение доли" required />
      </div>

      <div className="form-group">
        <label htmlFor="alpha">Уровень значимости α</label>
        <input id="alpha" type="number" min="0.001" max="0.999" step="0.001" value={alpha} onChange={(event) => setAlpha(event.target.value)} required />
      </div>

      <div className="form-group">
        <label htmlFor="alternative">Гипотеза</label>
        <select id="alternative" value={alternative} onChange={(event) => setAlternative(event.target.value as Alternative)}>
          <option value="two-sided">p ≠ p₀</option>
          <option value="less">p &lt; p₀</option>
          <option value="greater">p &gt; p₀</option>
        </select>
      </div>

      <button className="primary-button" type="submit">Запустить анализ</button>
    </form>
  );
}
