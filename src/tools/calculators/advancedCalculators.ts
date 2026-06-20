import { jStat } from "jstat";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { round } from "../../lib/statistics";

function confidence(settings: Record<string, unknown>): number {
  const value = Number(settings.confidenceLevel);
  if (![0.9, 0.95, 0.99].includes(value)) throw new Error("Выберите уровень доверия.");
  return value;
}

export function runSampleSizeMean(settings: Record<string, unknown>): CalculationResult {
  const confidenceLevel = confidence(settings);
  const standardDeviation = Number(settings.standardDeviation);
  const marginOfError = Number(settings.marginOfError);
  if (!(standardDeviation > 0) || !(marginOfError > 0)) throw new Error("Стандартное отклонение и погрешность должны быть больше нуля.");
  const zCritical = jStat.normal.inv(1 - (1 - confidenceLevel) / 2, 0, 1);
  const calculatedN = (zCritical * standardDeviation / marginOfError) ** 2;

  return createCalculationResult([
    { type: "table", title: "Размер выборки для оценки среднего", columns: ["Показатель", "Значение"], rows: [
      { Показатель: "z-критическое", Значение: round(zCritical) },
      { Показатель: "Стандартное отклонение", Значение: standardDeviation },
      { Показатель: "Допустимая погрешность", Значение: marginOfError },
      { Показатель: "Расчётное n", Значение: round(calculatedN) },
      { Показатель: "Минимальное n", Значение: Math.ceil(calculatedN) }
    ] },
    { type: "formula", title: "Формула", content: "n = (z · s / e)²" },
    { type: "text", title: "Вывод", content: `Необходимый размер выборки: не менее ${Math.ceil(calculatedN)} наблюдений.` }
  ]);
}

export function runConfidenceIntervalMean(settings: Record<string, unknown>): CalculationResult {
  const confidenceLevel = confidence(settings);
  const sampleMean = Number(settings.mean);
  const standardDeviation = Number(settings.standardDeviation);
  const sampleSize = Number(settings.sampleSize);
  if (!Number.isFinite(sampleMean) || !(standardDeviation >= 0) || !Number.isInteger(sampleSize) || sampleSize < 2) {
    throw new Error("Проверьте среднее, стандартное отклонение и размер выборки (n ≥ 2). ");
  }
  const standardError = standardDeviation / Math.sqrt(sampleSize);
  const tCritical = jStat.studentt.inv(1 - (1 - confidenceLevel) / 2, sampleSize - 1);
  const margin = tCritical * standardError;

  return createCalculationResult([
    { type: "table", title: "Доверительный интервал для среднего", columns: ["Показатель", "Значение"], rows: [
      { Показатель: "Нижняя граница", Значение: round(sampleMean - margin) },
      { Показатель: "Верхняя граница", Значение: round(sampleMean + margin) },
      { Показатель: "t-критическое", Значение: round(tCritical) },
      { Показатель: "Стандартная ошибка", Значение: round(standardError) }
    ] },
    { type: "formula", title: "Формула", content: "CI = x̄ ± tcrit · s / √n" },
    { type: "text", title: "Вывод", content: `${confidenceLevel * 100}% доверительный интервал: [${round(sampleMean - margin)}, ${round(sampleMean + margin)}].` }
  ]);
}

export function runConfidenceIntervalProportion(settings: Record<string, unknown>): CalculationResult {
  const confidenceLevel = confidence(settings);
  const successes = Number(settings.successes);
  const sampleSize = Number(settings.sampleSize);
  if (!Number.isInteger(sampleSize) || sampleSize < 1 || !Number.isInteger(successes) || successes < 0 || successes > sampleSize) {
    throw new Error("Успехи должны быть целым числом от 0 до размера выборки.");
  }
  const observed = successes / sampleSize;
  const zCritical = jStat.normal.inv(1 - (1 - confidenceLevel) / 2, 0, 1);
  const standardError = Math.sqrt(observed * (1 - observed) / sampleSize);
  const lower = Math.max(0, observed - zCritical * standardError);
  const upper = Math.min(1, observed + zCritical * standardError);

  return createCalculationResult([
    { type: "table", title: "Доверительный интервал для доли", columns: ["Показатель", "Значение"], rows: [
      { Показатель: "Наблюдаемая доля", Значение: round(observed) },
      { Показатель: "Нижняя граница", Значение: round(lower) },
      { Показатель: "Верхняя граница", Значение: round(upper) },
      { Показатель: "z-критическое", Значение: round(zCritical) },
      { Показатель: "Стандартная ошибка", Значение: round(standardError) }
    ] },
    { type: "formula", title: "Формула", content: "p̂ ± zcrit · √(p̂(1 − p̂) / n)" },
    { type: "text", title: "Вывод", content: `${confidenceLevel * 100}% доверительный интервал доли: [${round(lower)}, ${round(upper)}].` }
  ]);
}

export function runCohensD(settings: Record<string, unknown>): CalculationResult {
  const mean1 = Number(settings.mean1); const mean2 = Number(settings.mean2);
  const sd1 = Number(settings.sd1); const sd2 = Number(settings.sd2);
  const n1 = Number(settings.n1); const n2 = Number(settings.n2);
  if (![mean1, mean2, sd1, sd2, n1, n2].every(Number.isFinite) || sd1 < 0 || sd2 < 0 || !Number.isInteger(n1) || !Number.isInteger(n2) || n1 < 2 || n2 < 2) {
    throw new Error("Проверьте значения: SD ≥ 0, размеры групп — целые числа не меньше 2.");
  }
  const pooledSD = Math.sqrt(((n1 - 1) * sd1 ** 2 + (n2 - 1) * sd2 ** 2) / (n1 + n2 - 2));
  if (pooledSD === 0) throw new Error("Объединённое стандартное отклонение равно нулю.");
  const d = (mean1 - mean2) / pooledSD;
  const absolute = Math.abs(d);
  const interpretation = absolute < 0.2 ? "очень малый эффект" : absolute < 0.5 ? "малый эффект" : absolute < 0.8 ? "средний эффект" : "большой эффект";

  return createCalculationResult([
    { type: "table", title: "Cohen’s d", columns: ["Показатель", "Значение"], rows: [
      { Показатель: "Объединённое SD", Значение: round(pooledSD) },
      { Показатель: "Cohen’s d", Значение: round(d) }
    ] },
    { type: "formula", title: "Формула", content: "d = (mean₁ − mean₂) / pooledSD" },
    { type: "text", title: "Интерпретация", content: `|d| = ${round(absolute)}: ${interpretation}.` }
  ]);
}
