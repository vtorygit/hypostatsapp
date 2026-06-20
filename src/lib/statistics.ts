import { jStat } from "jstat";

export function averageRanks(values: number[]): { ranks: number[]; tieTerm: number } {
  const sorted = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(values.length);
  let tieTerm = 0;

  for (let i = 0; i < sorted.length; ) {
    let end = i + 1;
    while (end < sorted.length && sorted[end].value === sorted[i].value) end++;
    const rank = (i + 1 + end) / 2;
    const tieSize = end - i;
    if (tieSize > 1) tieTerm += tieSize ** 3 - tieSize;
    for (let j = i; j < end; j++) ranks[sorted[j].index] = rank;
    i = end;
  }

  return { ranks, tieTerm };
}

export function pearson(x: number[], y: number[]): number {
  const meanX = x.reduce((sum, value) => sum + value, 0) / x.length;
  const meanY = y.reduce((sum, value) => sum + value, 0) / y.length;
  const numerator = x.reduce(
    (sum, value, index) => sum + (value - meanX) * (y[index] - meanY),
    0
  );
  const denominator = Math.sqrt(
    x.reduce((sum, value) => sum + (value - meanX) ** 2, 0) *
      y.reduce((sum, value) => sum + (value - meanY) ** 2, 0)
  );
  return denominator === 0 ? Number.NaN : numerator / denominator;
}

export function spearman(x: number[], y: number[]): number {
  return pearson(averageRanks(x).ranks, averageRanks(y).ranks);
}

export function twoSidedNormalPValue(z: number): number {
  return Math.min(1, 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1)));
}

export function round(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}
