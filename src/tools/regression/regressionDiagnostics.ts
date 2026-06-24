import { jStat } from "jstat";
import { pearson } from "../../lib/statistics";
import {
  calculateAuxiliaryRSquared,
  calculateVif,
  type MultipleLinearRegressionModel
} from "./multipleLinearRegression";

export function calculateBreuschPagan(model: MultipleLinearRegressionModel) {
  const squaredResiduals = model.observations.map((item) => item.residual ** 2);
  const rSquared = Math.max(
    0,
    calculateAuxiliaryRSquared(model.designRows, squaredResiduals)
  );
  const statistic = model.n * rSquared;
  const df = model.predictorColumns.length;
  const pValue = 1 - jStat.chisquare.cdf(statistic, df);
  return { statistic, df, pValue };
}

export function calculateShapiroWilkApproximation(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  if (n < 3) throw new Error("Для проверки нормальности нужно минимум 3 остатка.");
  const expected = sorted.map((_, index) =>
    jStat.normal.inv((index + 1 - 0.375) / (n + 0.25), 0, 1)
  );
  const norm = Math.sqrt(expected.reduce((sum, value) => sum + value ** 2, 0));
  const coefficients = expected.map((value) => value / norm);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / n;
  const denominator = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  if (denominator <= Number.EPSILON) {
    return { statistic: 1, pValue: 1 };
  }
  const numerator = coefficients.reduce(
    (sum, coefficient, index) => sum + coefficient * sorted[index],
    0
  ) ** 2;
  const statistic = Math.min(0.999999, Math.max(0.000001, numerator / denominator));
  const logOneMinusW = Math.log(1 - statistic);
  let z: number;

  if (n <= 11) {
    const gamma = -2.273 + 0.459 * n;
    const transformed = -Math.log(Math.max(Number.EPSILON, gamma - logOneMinusW));
    const meanZ = 0.544 - 0.39978 * n + 0.025054 * n ** 2 - 0.0006714 * n ** 3;
    const sdZ = Math.exp(1.3822 - 0.77857 * n + 0.062767 * n ** 2 - 0.0020322 * n ** 3);
    z = (transformed - meanZ) / sdZ;
  } else {
    const logN = Math.log(n);
    const meanZ = -1.5861 - 0.31082 * logN - 0.083751 * logN ** 2 + 0.0038915 * logN ** 3;
    const sdZ = Math.exp(-0.4803 - 0.082676 * logN + 0.0030302 * logN ** 2);
    z = (logOneMinusW - meanZ) / sdZ;
  }

  return {
    statistic,
    pValue: Math.min(1, Math.max(0, 1 - jStat.normal.cdf(z, 0, 1)))
  };
}

export function calculatePairwisePredictorCorrelations(
  model: MultipleLinearRegressionModel
) {
  const rows: Array<{ first: string; second: string; correlation: number }> = [];
  const numericFeatures = model.features
    .map((feature, index) => ({ feature, index }))
    .filter(({ feature }) => feature.kind === "numeric");
  numericFeatures.forEach(({ feature: first, index: firstIndex }, listIndex) => {
    numericFeatures.slice(listIndex + 1).forEach(({ feature: second, index: secondIndex }) => {
      rows.push({
        first: first.name,
        second: second.name,
        correlation: pearson(
          model.designRows.map((row) => row[firstIndex + 1]),
          model.designRows.map((row) => row[secondIndex + 1])
        )
      });
    });
  });
  return rows;
}

export { calculateVif };
