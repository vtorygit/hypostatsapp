import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { averageRanks, round, twoSidedNormalPValue } from "../../lib/statistics";

function alphaFrom(settings: Record<string, unknown>): number {
  const alpha = Number(settings.alpha);
  if (!(alpha > 0 && alpha < 1)) throw new Error("Уровень значимости должен быть от 0 до 1.");
  return alpha;
}

function conclusion(pValue: number, alpha: number): string {
  return pValue < alpha ? "Нулевая гипотеза отвергается." : "Нет оснований отвергнуть нулевую гипотезу.";
}

export function runMannWhitneyUTest(dataset: Dataset, settings: Record<string, unknown>): CalculationResult {
  const valueColumn = String(settings.valueColumn ?? ""); const groupColumn = String(settings.groupColumn ?? "");
  const group1 = String(settings.group1 ?? ""); const group2 = String(settings.group2 ?? ""); const alpha = alphaFrom(settings);
  if (!valueColumn || !groupColumn || !group1 || !group2 || group1 === group2) throw new Error("Выберите числовую переменную и две разные группы.");
  const values1 = dataset.rows.filter((row) => String(row[groupColumn]) === group1 && typeof row[valueColumn] === "number" && Number.isFinite(row[valueColumn])).map((row) => row[valueColumn] as number);
  const values2 = dataset.rows.filter((row) => String(row[groupColumn]) === group2 && typeof row[valueColumn] === "number" && Number.isFinite(row[valueColumn])).map((row) => row[valueColumn] as number);
  if (values1.length < 1 || values2.length < 1) throw new Error("В каждой группе должно быть хотя бы одно числовое наблюдение.");
  const combined = [...values1, ...values2]; const { ranks, tieTerm } = averageRanks(combined);
  const n1 = values1.length; const n2 = values2.length; const n = n1 + n2;
  const rankSum1 = ranks.slice(0, n1).reduce((sum, value) => sum + value, 0);
  const u1 = rankSum1 - n1 * (n1 + 1) / 2; const u2 = n1 * n2 - u1; const u = Math.min(u1, u2);
  const meanU = n1 * n2 / 2;
  const variance = n1 * n2 / 12 * (n + 1 - tieTerm / (n * (n - 1)));
  if (!(variance > 0)) throw new Error("Статистика не определена для этих данных.");
  const z = (Math.max(0, Math.abs(u - meanU) - 0.5)) / Math.sqrt(variance);
  const pValue = twoSidedNormalPValue(z);
  return createCalculationResult([
    { type: "table", title: "Критерий Манна–Уитни", columns: ["Показатель", "Значение"], rows: [
      { Показатель: "Группа 1", Значение: group1 }, { Показатель: "Группа 2", Значение: group2 },
      { Показатель: "n1", Значение: n1 }, { Показатель: "n2", Значение: n2 }, { Показатель: "U", Значение: round(u) },
      { Показатель: "z", Значение: round(z) }, { Показатель: "p-value", Значение: round(pValue, 6) }, { Показатель: "α", Значение: alpha }
    ] },
    { type: "text", title: "Вывод", content: conclusion(pValue, alpha) }
  ]);
}

export function runWilcoxonSignedRankTest(dataset: Dataset, settings: Record<string, unknown>): CalculationResult {
  const before = String(settings.beforeColumn ?? ""); const after = String(settings.afterColumn ?? ""); const alpha = alphaFrom(settings);
  if (!before || !after || before === after) throw new Error("Выберите два разных столбца.");
  const differences = dataset.rows.map((row) => {
    const a = row[before]; const b = row[after];
    return typeof a === "number" && Number.isFinite(a) && typeof b === "number" && Number.isFinite(b) ? b - a : null;
  }).filter((value): value is number => value !== null && value !== 0);
  if (differences.length < 2) throw new Error("Нужно минимум две ненулевые парные разности.");
  const absolute = differences.map(Math.abs); const { ranks } = averageRanks(absolute); const n = differences.length;
  const wPlus = ranks.reduce((sum, rank, index) => sum + (differences[index] > 0 ? rank : 0), 0);
  const wMinus = n * (n + 1) / 2 - wPlus; const w = Math.min(wPlus, wMinus);
  const tieCounts = new Map<number, number>(); absolute.forEach((value) => tieCounts.set(value, (tieCounts.get(value) ?? 0) + 1));
  const tieCorrection = [...tieCounts.values()].reduce((sum, t) => sum + t * (t - 1) * (2 * t + 5), 0);
  const variance = (n * (n + 1) * (2 * n + 1) - tieCorrection / 2) / 24;
  const expected = n * (n + 1) / 4; const z = Math.max(0, Math.abs(wPlus - expected) - 0.5) / Math.sqrt(variance);
  const pValue = twoSidedNormalPValue(z);
  return createCalculationResult([
    { type: "table", title: "Критерий Уилкоксона", columns: ["Показатель", "Значение"], rows: [
      { Показатель: "n ненулевых разностей", Значение: n }, { Показатель: "W+", Значение: round(wPlus) },
      { Показатель: "W−", Значение: round(wMinus) }, { Показатель: "W", Значение: round(w) },
      { Показатель: "z", Значение: round(z) }, { Показатель: "p-value", Значение: round(pValue, 6) }, { Показатель: "α", Значение: alpha }
    ] },
    { type: "text", title: "Вывод", content: conclusion(pValue, alpha) }
  ]);
}

export function runKruskalWallisTest(dataset: Dataset, settings: Record<string, unknown>): CalculationResult {
  const valueColumn = String(settings.valueColumn ?? ""); const groupColumn = String(settings.groupColumn ?? ""); const alpha = alphaFrom(settings);
  const observations = dataset.rows.map((row) => ({ value: row[valueColumn], group: row[groupColumn] }))
    .filter((item): item is { value: number; group: string | number } => typeof item.value === "number" && Number.isFinite(item.value) && item.group !== null && item.group !== undefined && item.group !== "")
    .map((item) => ({ value: item.value, group: String(item.group) }));
  const groups = Array.from(new Set(observations.map((item) => item.group)));
  if (groups.length < 2) throw new Error("Нужно минимум две группы с числовыми наблюдениями.");
  const { ranks, tieTerm } = averageRanks(observations.map((item) => item.value)); const n = observations.length;
  let h = groups.reduce((sum, group) => {
    const indices = observations.map((item, index) => item.group === group ? index : -1).filter((index) => index >= 0);
    const rankSum = indices.reduce((total, index) => total + ranks[index], 0);
    return sum + rankSum ** 2 / indices.length;
  }, 0) * 12 / (n * (n + 1)) - 3 * (n + 1);
  const correction = 1 - tieTerm / (n ** 3 - n); if (correction > 0) h /= correction;
  const df = groups.length - 1; const pValue = 1 - jStat.chisquare.cdf(h, df);
  return createCalculationResult([
    { type: "table", title: "Критерий Краскела–Уоллиса", columns: ["Показатель", "Значение"], rows: [
      { Показатель: "Количество групп", Значение: groups.length }, { Показатель: "n", Значение: n },
      { Показатель: "H", Значение: round(h) }, { Показатель: "df", Значение: df },
      { Показатель: "p-value", Значение: round(pValue, 6) }, { Показатель: "α", Значение: alpha }
    ] },
    { type: "text", title: "Вывод", content: conclusion(pValue, alpha) }
  ]);
}

export function runSignTest(dataset: Dataset, settings: Record<string, unknown>): CalculationResult {
  const before = String(settings.beforeColumn ?? ""); const after = String(settings.afterColumn ?? ""); const alpha = alphaFrom(settings);
  if (!before || !after || before === after) throw new Error("Выберите два разных столбца.");
  const signs = dataset.rows.map((row) => {
    const a = row[before]; const b = row[after];
    return typeof a === "number" && Number.isFinite(a) && typeof b === "number" && Number.isFinite(b) ? Math.sign(b - a) : 0;
  }).filter((sign) => sign !== 0);
  if (signs.length < 1) throw new Error("Нет ненулевых парных разностей.");
  const positive = signs.filter((sign) => sign > 0).length; const negative = signs.length - positive; const statistic = Math.min(positive, negative);
  const pValue = Math.min(1, 2 * jStat.binomial.cdf(statistic, signs.length, 0.5));
  return createCalculationResult([
    { type: "table", title: "Критерий знаков", columns: ["Показатель", "Значение"], rows: [
      { Показатель: "Положительные разности", Значение: positive }, { Показатель: "Отрицательные разности", Значение: negative },
      { Показатель: "n без нулевых разностей", Значение: signs.length }, { Показатель: "Статистика", Значение: statistic },
      { Показатель: "p-value", Значение: round(pValue, 6) }, { Показатель: "α", Значение: alpha }
    ] },
    { type: "text", title: "Вывод", content: conclusion(pValue, alpha) }
  ]);
}
