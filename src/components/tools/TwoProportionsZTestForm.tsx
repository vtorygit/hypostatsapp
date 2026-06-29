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
    .sort(
      (left, right) =>
        right.count - left.count || left.value.localeCompare(right.value, "ru")
    );

  return {
    name: column,
    categories,
    isLikelyContinuousNumeric:
      nonEmptyCount > 0 &&
      numericCount / nonEmptyCount >= 0.9 &&
      categories.length > MAX_CATEGORY_VALUES
  };
}

type ProportionSelectorProps = {
  id: "first" | "second";
  title: string;
  hint: string;
  column: string;
  selectedValues: string[];
  columnSummaries: ColumnSummary[];
  selectableColumns: ColumnSummary[];
  onColumnChange: (column: string) => void;
  onSelectedValuesChange: (values: string[]) => void;
};

function ProportionSelector({
  id,
  title,
  hint,
  column,
  selectedValues,
  columnSummaries,
  selectableColumns,
  onColumnChange,
  onSelectedValuesChange
}: ProportionSelectorProps) {
  const activeColumnSummary = columnSummaries.find(
    (summary) => summary.name === column
  );

  function toggleSelectedValue(value: string) {
    onSelectedValuesChange(
      selectedValues.includes(value)
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value]
    );
  }

  return (
    <div className="proportion-section">
      <div>
        <h3>{title}</h3>
        <p className="field-hint">{hint}</p>
      </div>

      <div className="form-group">
        <label htmlFor={`${id}-column`}>Выберите переменную</label>
        <select
          id={`${id}-column`}
          value={column}
          onChange={(event) => {
            onColumnChange(event.target.value);
            onSelectedValuesChange([]);
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
        <label>Выберите категории</label>
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
      </div>
    </div>
  );
}

export function TwoProportionsZTestForm({
  dataset,
  onRun
}: DatasetToolFormProps) {
  const [firstColumn, setFirstColumn] = useState(dataset.columns[0] ?? "");
  const [secondColumn, setSecondColumn] = useState(dataset.columns[0] ?? "");
  const [firstValues, setFirstValues] = useState<string[]>([]);
  const [secondValues, setSecondValues] = useState<string[]>([]);
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

  useEffect(() => {
    const firstSelectableColumn = selectableColumns[0]?.name ?? "";

    if (
      firstColumn &&
      selectableColumns.some((summary) => summary.name === firstColumn)
    ) {
      return;
    }

    setFirstColumn(firstSelectableColumn);
    setFirstValues([]);
  }, [firstColumn, selectableColumns]);

  useEffect(() => {
    const firstSelectableColumn = selectableColumns[0]?.name ?? "";

    if (
      secondColumn &&
      selectableColumns.some((summary) => summary.name === secondColumn)
    ) {
      return;
    }

    setSecondColumn(firstSelectableColumn);
    setSecondValues([]);
  }, [secondColumn, selectableColumns]);

  function countSelectedRows(column: string, values: string[]) {
    const selectedValueSet = new Set(values);

    return dataset.rows.filter((row) => {
      const value = row[column];
      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        selectedValueSet.has(String(value))
      );
    }).length;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (firstValues.length === 0 || secondValues.length === 0) {
      setSelectionError("Выберите категории для первой и второй доли.");
      return;
    }

    const sampleSize1 = dataset.rows.filter(
      (row) => row[firstColumn] !== null && row[firstColumn] !== undefined && row[firstColumn] !== ""
    ).length;
    const sampleSize2 = dataset.rows.filter(
      (row) => row[secondColumn] !== null && row[secondColumn] !== undefined && row[secondColumn] !== ""
    ).length;

    onRun({
      successes1: countSelectedRows(firstColumn, firstValues),
      sampleSize1,
      successes2: countSelectedRows(secondColumn, secondValues),
      sampleSize2,
      firstColumn,
      secondColumn,
      firstValues,
      secondValues,
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      {selectableColumns.length === 0 && (
        <div className="error-box">
          В файле не найдено категориальных переменных для расчёта долей.
        </div>
      )}

      <ProportionSelector
        id="first"
        title="Доля 1"
        hint="Эти категории будут считаться успехом при расчёте первой доли."
        column={firstColumn}
        selectedValues={firstValues}
        columnSummaries={columnSummaries}
        selectableColumns={selectableColumns}
        onColumnChange={setFirstColumn}
        onSelectedValuesChange={(values) => {
          setFirstValues(values);
          setSelectionError(null);
        }}
      />

      <ProportionSelector
        id="second"
        title="Доля 2"
        hint="Эти категории будут считаться успехом при расчёте второй доли."
        column={secondColumn}
        selectedValues={secondValues}
        columnSummaries={columnSummaries}
        selectableColumns={selectableColumns}
        onColumnChange={setSecondColumn}
        onSelectedValuesChange={(values) => {
          setSecondValues(values);
          setSelectionError(null);
        }}
      />

      {selectionError && <div className="error-box">{selectionError}</div>}

      <div className="form-group">
        <label htmlFor="alpha">Уровень значимости α</label>
        <input
          id="alpha"
          type="number"
          min="0.001"
          max="0.999"
          step="0.001"
          value={alpha}
          onChange={(event) => setAlpha(event.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="alternative">Гипотеза</label>
        <select
          id="alternative"
          value={alternative}
          onChange={(event) => setAlternative(event.target.value as Alternative)}
        >
          <option value="two-sided">p₁ ≠ p₂</option>
          <option value="less">p₁ &lt; p₂</option>
          <option value="greater">p₁ &gt; p₂</option>
        </select>
      </div>

      <button className="primary-button" type="submit">Запустить анализ</button>
    </form>
  );
}
