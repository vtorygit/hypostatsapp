import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { round } from "../../lib/statistics";

export function runSimpleLinearRegression(dataset: Dataset, settings: Record<string, unknown>): CalculationResult {
  const xColumn = String(settings.xColumn ?? "");
  const yColumn = String(settings.yColumn ?? "");
  if (!xColumn || !yColumn || xColumn === yColumn) throw new Error("Выберите два разных числовых столбца.");
  const pairs = dataset.rows.map((row) => ({ x: row[xColumn], y: row[yColumn] }))
    .filter((pair): pair is { x: number; y: number } => typeof pair.x === "number" && Number.isFinite(pair.x) && typeof pair.y === "number" && Number.isFinite(pair.y));
  if (pairs.length < 3) throw new Error("Для регрессии нужно минимум 3 числовые пары.");
  const n = pairs.length;
  const meanX = pairs.reduce((sum, pair) => sum + pair.x, 0) / n;
  const meanY = pairs.reduce((sum, pair) => sum + pair.y, 0) / n;
  const sxx = pairs.reduce((sum, pair) => sum + (pair.x - meanX) ** 2, 0);
  if (sxx === 0) throw new Error("Переменная X не должна быть константой.");
  const slope = pairs.reduce((sum, pair) => sum + (pair.x - meanX) * (pair.y - meanY), 0) / sxx;
  const intercept = meanY - slope * meanX;
  const observations = pairs.map((pair) => ({ ...pair, predicted: intercept + slope * pair.x, residual: pair.y - (intercept + slope * pair.x) }));
  const rss = observations.reduce((sum, item) => sum + item.residual ** 2, 0);
  const tss = pairs.reduce((sum, pair) => sum + (pair.y - meanY) ** 2, 0);
  if (tss === 0) throw new Error("Переменная Y не должна быть константой.");
  const rSquared = 1 - rss / tss;
  const residualStandardError = Math.sqrt(rss / (n - 2));
  const slopeStandardError = residualStandardError / Math.sqrt(sxx);
  const tStatistic = slopeStandardError === 0 ? (slope === 0 ? 0 : Number.POSITIVE_INFINITY) : slope / slopeStandardError;
  const pValue = Number.isFinite(tStatistic) ? 2 * (1 - jStat.studentt.cdf(Math.abs(tStatistic), n - 2)) : 0;

  return createCalculationResult([
    { type: "table", title: "Коэффициенты модели", columns: ["Коэффициент", "Оценка", "Стандартная ошибка", "t", "p-value"], rows: [
      { Коэффициент: "Intercept", Оценка: round(intercept), "Стандартная ошибка": "—", t: "—", "p-value": "—" },
      { Коэффициент: xColumn, Оценка: round(slope), "Стандартная ошибка": round(slopeStandardError), t: round(tStatistic), "p-value": round(pValue, 6) }
    ] },
    { type: "table", title: "Метрики модели", columns: ["Показатель", "Значение"], rows: [
      { Показатель: "n", Значение: n }, { Показатель: "R²", Значение: round(rSquared) },
      { Показатель: "Стандартная ошибка остатков", Значение: round(residualStandardError) }, { Показатель: "df", Значение: n - 2 }
    ] },
    { type: "table", title: "Прогнозы и остатки (первые 20)", columns: ["x", "y", "predicted", "residual"], rows: observations.slice(0, 20).map((item) => ({ x: item.x, y: item.y, predicted: round(item.predicted), residual: round(item.residual) })) },
    { type: "formula", title: "Формула модели", content: `y = ${round(intercept)} ${slope < 0 ? "−" : "+"} ${round(Math.abs(slope))} · x` },
    { type: "text", title: "Вывод", content: `Модель объясняет ${(rSquared * 100).toFixed(2)}% вариации Y. Коэффициент при X ${pValue < 0.05 ? "статистически значим" : "не является статистически значимым"} при α = 0.05.` }
  ]);
}
