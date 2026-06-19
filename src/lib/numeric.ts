import type { Dataset } from "../types/dataset";

export function getNumericValues(dataset: Dataset, column: string): number[] {
  return dataset.rows
    .map((row) => row[column])
    .filter((value) => typeof value === "number" && !Number.isNaN(value)) as number[];
}

export function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sampleVariance(values: number[]): number {
  const m = mean(values);
  const squaredDiffs = values.map((value) => Math.pow(value - m, 2));

  return squaredDiffs.reduce((sum, value) => sum + value, 0) / (values.length - 1);
}

export function sampleStandardDeviation(values: number[]): number {
  return Math.sqrt(sampleVariance(values));
}

export function validateNumericSample(values: number[], label: string): void {
  if (values.length < 2) {
    throw new Error(`${label}: нужно минимум 2 числовых наблюдения.`);
  }
}
