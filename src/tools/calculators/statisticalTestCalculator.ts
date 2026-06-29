import type { Dataset, DatasetRow } from "../../types/dataset";
import type { CalculationResult } from "../../types/results";
import { runOneProportionZTest } from "../hypothesis/oneProportionZTest";
import { runTwoProportionsZTest } from "../hypothesis/twoProportionsZTest";
import { runOneSampleTTest } from "../hypothesis/oneSampleTTest";
import { runIndependentSamplesTTest } from "../hypothesis/independentSamplesTTest";
import { runPairedSamplesTTest } from "../hypothesis/pairedSamplesTTest";
import { runChiSquareIndependenceTest } from "../hypothesis/chiSquareIndependenceTest";
import {
  runKruskalWallisTest,
  runMannWhitneyUTest,
  runSignTest,
  runWilcoxonSignedRankTest
} from "../hypothesis/nonparametricTests";

function parseNumbers(raw: unknown, label: string): number[] {
  const values = String(raw ?? "")
    .trim()
    .split(/[;\s]+/)
    .filter(Boolean)
    .map((value) => Number(value.replace(",", ".")));

  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error(`${label}: введите числа через пробел.`);
  }

  return values;
}

function parseCategories(raw: unknown, label: string): string[] {
  const values = String(raw ?? "")
    .split(";")
    .map((value) => value.trim())
    .filter(Boolean);
  if (values.length === 0) throw new Error(`${label}: введите значения через точку с запятой.`);
  return values;
}

function makeDataset(columns: string[], rows: DatasetRow[]): Dataset {
  return {
    fileName: "Ручной ввод",
    columns,
    rows,
    rowCount: rows.length,
    columnCount: columns.length
  };
}

function pairedDataset(settings: Record<string, unknown>): Dataset {
  const before = parseNumbers(settings.beforeValues, "Первый набор");
  const after = parseNumbers(settings.afterValues, "Второй набор");
  if (before.length !== after.length) {
    throw new Error("В парных наборах должно быть одинаковое количество значений.");
  }
  return makeDataset(
    ["before", "after"],
    before.map((value, index) => ({ before: value, after: after[index] }))
  );
}

export function runStatisticalTestCalculator(
  settings: Record<string, unknown>
): CalculationResult {
  const testId = String(settings.testId ?? "");
  const alpha = Number(settings.alpha);
  const alternative = settings.alternative;

  if (testId === "one-proportion-z-test") {
    return runOneProportionZTest(makeDataset([], []), {
      successes: Number(settings.successes),
      sampleSize: Number(settings.sampleSize),
      hypothesizedProportion: Number(settings.hypothesizedProportion),
      alpha,
      alternative
    });
  }

  if (testId === "two-proportions-z-test") {
    return runTwoProportionsZTest(makeDataset([], []), {
      successes1: Number(settings.successes1),
      sampleSize1: Number(settings.sampleSize1),
      successes2: Number(settings.successes2),
      sampleSize2: Number(settings.sampleSize2),
      alpha,
      alternative
    });
  }

  if (testId === "one-sample-t-test") {
    const values = parseNumbers(settings.values, "Числовая выборка");
    const dataset = makeDataset(["value"], values.map((value) => ({ value })));
    return runOneSampleTTest(dataset, {
      column: "value",
      mu0: Number(settings.mu0),
      alpha,
      alternative
    });
  }

  if (testId === "independent-samples-t-test") {
    const first = parseNumbers(settings.group1Values, "Первая группа");
    const second = parseNumbers(settings.group2Values, "Вторая группа");
    const dataset = makeDataset(
      ["value", "group"],
      [
        ...first.map((value) => ({ value, group: "Группа 1" })),
        ...second.map((value) => ({ value, group: "Группа 2" }))
      ]
    );
    return runIndependentSamplesTTest(dataset, {
      valueColumn: "value",
      groupColumn: "group",
      group1Value: "Группа 1",
      group2Value: "Группа 2",
      alpha,
      alternative
    });
  }

  if (testId === "paired-samples-t-test") {
    return runPairedSamplesTTest(pairedDataset(settings), {
      beforeColumn: "before",
      afterColumn: "after",
      alpha,
      alternative
    });
  }

  if (testId === "chi-square-independence-test") {
    const first = parseCategories(settings.category1Values, "Первая переменная");
    const second = parseCategories(settings.category2Values, "Вторая переменная");
    if (first.length !== second.length) {
      throw new Error("У категориальных переменных должно быть одинаковое количество значений.");
    }
    const dataset = makeDataset(
      ["first", "second"],
      first.map((value, index) => ({ first: value, second: second[index] }))
    );
    return runChiSquareIndependenceTest(dataset, {
      rowColumn: "first",
      columnColumn: "second",
      alpha
    });
  }

  if (testId === "mann-whitney-u-test") {
    const first = parseNumbers(settings.group1Values, "Первая группа");
    const second = parseNumbers(settings.group2Values, "Вторая группа");
    const dataset = makeDataset(
      ["value", "group"],
      [
        ...first.map((value) => ({ value, group: "Группа 1" })),
        ...second.map((value) => ({ value, group: "Группа 2" }))
      ]
    );
    return runMannWhitneyUTest(dataset, {
      valueColumn: "value",
      groupColumn: "group",
      group1: "Группа 1",
      group2: "Группа 2",
      alpha
    });
  }

  if (testId === "wilcoxon-signed-rank-test") {
    return runWilcoxonSignedRankTest(pairedDataset(settings), {
      beforeColumn: "before",
      afterColumn: "after",
      alpha
    });
  }

  if (testId === "sign-test") {
    return runSignTest(pairedDataset(settings), {
      beforeColumn: "before",
      afterColumn: "after",
      alpha
    });
  }

  if (testId === "kruskal-wallis-test") {
    const lines = String(settings.groupedValues ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2) throw new Error("Введите минимум две группы, каждую с новой строки.");
    const rows = lines.flatMap((line, index) => {
      const separator = line.indexOf(":");
      const name = separator >= 0 ? line.slice(0, separator).trim() : `Группа ${index + 1}`;
      const rawValues = separator >= 0 ? line.slice(separator + 1) : line;
      return parseNumbers(rawValues, name).map((value) => ({ value, group: name }));
    });
    return runKruskalWallisTest(makeDataset(["value", "group"], rows), {
      valueColumn: "value",
      groupColumn: "group",
      alpha
    });
  }

  throw new Error("Выберите статистический тест.");
}
