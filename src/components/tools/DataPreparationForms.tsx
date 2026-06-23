import { useMemo, useState } from "react";
import type { DatasetToolFormProps } from "../../types/tools";

export function DataPreviewForm({ onRun }: DatasetToolFormProps) {
  return <button className="primary-button" onClick={() => onRun({})}>Показать данные</button>;
}

type MissingValueMethod =
  | "none"
  | "value"
  | "mean"
  | "median"
  | "zero"
  | "code999"
  | "deleteRows"
  | "deleteColumn";

type MissingValueStrategy = {
  method: MissingValueMethod;
  value: string;
};

export function MissingValuesForm({ dataset, onRun }: DatasetToolFormProps) {
  const [strategies, setStrategies] = useState<
    Record<string, MissingValueStrategy>
  >({});

  function updateStrategy(
    column: string,
    update: Partial<MissingValueStrategy>
  ) {
    setStrategies((current) => ({
      ...current,
      [column]: {
        method: current[column]?.method ?? "none",
        value: current[column]?.value ?? "",
        ...update
      }
    }));
  }

  return (
    <form
      className="tool-form missing-values-form"
      onSubmit={(event) => {
        event.preventDefault();
        onRun({ strategies });
      }}
    >
      <p className="form-hint">
        Для каждого столбца выберите способ обработки. По умолчанию данные не
        изменяются.
      </p>

      <div className="table-scroll">
        <table className="missing-values-table">
          <thead>
            <tr>
              <th>Переменная</th>
              <th>Пропуски</th>
              <th>Доля</th>
              <th>Способ обработки</th>
              <th>Значение</th>
            </tr>
          </thead>
          <tbody>
            {dataset.columns.map((column) => {
              const missingCount = dataset.rows.filter(
                (row) =>
                  row[column] === null ||
                  row[column] === undefined ||
                  row[column] === ""
              ).length;
              const missingPercent =
                dataset.rowCount === 0
                  ? 0
                  : (missingCount / dataset.rowCount) * 100;
              const strategy = strategies[column] ?? {
                method: "none",
                value: ""
              };

              return (
                <tr key={column}>
                  <td><strong>{column}</strong></td>
                  <td>{missingCount}</td>
                  <td>{missingPercent.toFixed(2)}%</td>
                  <td>
                    <select
                      aria-label={`Способ обработки пропусков: ${column}`}
                      value={strategy.method}
                      onChange={(event) =>
                        updateStrategy(column, {
                          method: event.target.value as MissingValueMethod
                        })
                      }
                    >
                      <option value="none">Ничего не делать</option>
                      <option value="value">Заполнить значением</option>
                      <option value="mean">Средним по переменной</option>
                      <option value="median">Медианой</option>
                      <option value="zero">Нулями</option>
                      <option value="code999">Кодом 999</option>
                      <option value="deleteRows">Удалить строки</option>
                      <option value="deleteColumn">Удалить переменную</option>
                    </select>
                  </td>
                  <td>
                    {strategy.method === "value" ? (
                      <input
                        className="missing-fill-value"
                        aria-label={`Значение для заполнения: ${column}`}
                        value={strategy.value}
                        onChange={(event) =>
                          updateStrategy(column, { value: event.target.value })
                        }
                        placeholder="Введите значение"
                        required
                      />
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button className="primary-button" type="submit">
        Применить и посмотреть результат
      </button>
    </form>
  );
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
      <p className="form-hint">
        За один запуск можно перекодировать только одну переменную.
      </p>
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
