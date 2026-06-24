import { jStat } from "jstat";
import type { Dataset } from "../../types/dataset";
import { createCalculationResult, type CalculationResult } from "../../types/results";
import { round } from "../../lib/statistics";
import {
  getColumnCategories,
  inferColumnKind,
  isMissingValue,
  type ColumnKind
} from "../../lib/columnTypes";

export type RegressionFeature = {
  name: string;
  sourceColumn: string;
  kind: ColumnKind;
  category?: string;
  baseline?: string;
};

export type RegressionObservation = {
  sourceValues: Record<string, string | number>;
  actual: number;
  predicted: number;
  residual: number;
};

export type MultipleLinearRegressionModel = {
  predictorColumns: string[];
  selectedPredictorColumns: string[];
  features: RegressionFeature[];
  yColumn: string;
  n: number;
  rSquared: number;
  mse: number;
  aic: number;
  bic: number;
  coefficients: Array<{
    name: string;
    estimate: number;
    standardError: number;
    tStatistic: number;
    pValue: number;
    lower: number;
    upper: number;
  }>;
  observations: RegressionObservation[];
  designRows: number[][];
};

function invertMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const augmented = matrix.map((row, rowIndex) => [
    ...row,
    ...Array.from({ length: n }, (_, columnIndex) => rowIndex === columnIndex ? 1 : 0)
  ]);

  for (let column = 0; column < n; column++) {
    let pivotRow = column;
    for (let row = column + 1; row < n; row++) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivotRow][column])) {
        pivotRow = row;
      }
    }
    if (Math.abs(augmented[pivotRow][column]) < 1e-12) {
      throw new Error("Матрица предикторов вырождена. Уберите дублирующие или константные переменные.");
    }
    [augmented[column], augmented[pivotRow]] = [augmented[pivotRow], augmented[column]];
    const pivot = augmented[column][column];
    augmented[column] = augmented[column].map((value) => value / pivot);
    for (let row = 0; row < n; row++) {
      if (row === column) continue;
      const factor = augmented[row][column];
      augmented[row] = augmented[row].map(
        (value, index) => value - factor * augmented[column][index]
      );
    }
  }

  return augmented.map((row) => row.slice(n));
}

function transposeMultiply(matrix: number[][]): number[][] {
  const columns = matrix[0].length;
  return Array.from({ length: columns }, (_, i) =>
    Array.from({ length: columns }, (_, j) =>
      matrix.reduce((sum, row) => sum + row[i] * row[j], 0)
    )
  );
}

function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) =>
    row.reduce((sum, value, index) => sum + value * vector[index], 0)
  );
}

function fitCoefficients(design: number[][], target: number[]) {
  const inverse = invertMatrix(transposeMultiply(design));
  const xty = Array.from({ length: design[0].length }, (_, column) =>
    design.reduce((sum, row, index) => sum + row[column] * target[index], 0)
  );
  return { coefficients: multiplyMatrixVector(inverse, xty), inverse };
}

export function calculateAuxiliaryRSquared(
  design: number[][],
  target: number[]
): number {
  const { coefficients } = fitCoefficients(design, target);
  const predictions = design.map((row) =>
    row.reduce((sum, value, index) => sum + value * coefficients[index], 0)
  );
  const mean = target.reduce((sum, value) => sum + value, 0) / target.length;
  const rss = target.reduce(
    (sum, value, index) => sum + (value - predictions[index]) ** 2,
    0
  );
  const tss = target.reduce((sum, value) => sum + (value - mean) ** 2, 0);
  return tss === 0 ? 0 : 1 - rss / tss;
}

export function calculateMultipleLinearRegression(
  dataset: Dataset,
  settings: Record<string, unknown>
): MultipleLinearRegressionModel {
  const yColumn = String(settings.yColumn ?? "");
  const predictorColumns = Array.isArray(settings.predictorColumns)
    ? settings.predictorColumns.map(String)
    : [];
  if (!yColumn || predictorColumns.length < 1) {
    throw new Error("Выберите зависимую переменную и минимум один предиктор.");
  }
  if (predictorColumns.includes(yColumn)) {
    throw new Error("Зависимая переменная не может одновременно быть предиктором.");
  }

  if (inferColumnKind(dataset, yColumn) !== "numeric") {
    throw new Error("Зависимая переменная должна быть числовой.");
  }

  const predictorKinds = Object.fromEntries(
    predictorColumns.map((column) => [column, inferColumnKind(dataset, column)])
  ) as Record<string, ColumnKind>;
  const features = predictorColumns.reduce<RegressionFeature[]>((all, column) => {
    const kind = predictorKinds[column];
    if (kind === "numeric") {
      all.push({ name: column, sourceColumn: column, kind });
      return all;
    }
    const categories = getColumnCategories(dataset, column);
    if (categories.length < 2) {
      throw new Error(`Категориальная переменная «${column}» должна содержать минимум две категории.`);
    }
    const baseline = categories[0];
    all.push(...categories.slice(1).map((category) => ({
      name: `${column}: ${category}`,
      sourceColumn: column,
      kind,
      category,
      baseline
    })));
    return all;
  }, []);

  const completeRows = dataset.rows.filter((row) =>
    typeof row[yColumn] === "number" &&
    Number.isFinite(row[yColumn]) &&
    predictorColumns.every((column) => {
      const value = row[column];
      return predictorKinds[column] === "numeric"
        ? typeof value === "number" && Number.isFinite(value)
        : !isMissingValue(value);
    })
  );
  const parameterCount = features.length + 1;
  if (completeRows.length <= parameterCount) {
    throw new Error(`Для модели нужно больше ${parameterCount} полных наблюдений.`);
  }

  const designRows = completeRows.map((row) => [
    1,
    ...features.map((feature) =>
      feature.kind === "numeric"
        ? row[feature.sourceColumn] as number
        : String(row[feature.sourceColumn]) === feature.category ? 1 : 0
    )
  ]);
  const target = completeRows.map((row) => row[yColumn] as number);
  const { coefficients: estimates, inverse } = fitCoefficients(designRows, target);
  const observations = completeRows.map((row, index) => {
    const predicted = designRows[index].reduce(
      (sum, value, coefficientIndex) => sum + value * estimates[coefficientIndex],
      0
    );
    return {
      sourceValues: Object.fromEntries(
        predictorColumns.map((column) => [column, row[column] as string | number])
      ),
      actual: target[index],
      predicted,
      residual: target[index] - predicted
    };
  });

  const n = observations.length;
  const meanY = target.reduce((sum, value) => sum + value, 0) / n;
  const rss = observations.reduce((sum, item) => sum + item.residual ** 2, 0);
  const tss = target.reduce((sum, value) => sum + (value - meanY) ** 2, 0);
  if (tss === 0) throw new Error("Зависимая переменная не должна быть константой.");
  const df = n - parameterCount;
  const mse = rss / df;
  const rSquared = 1 - rss / tss;
  const tCritical = jStat.studentt.inv(0.975, df);
  const names = ["Константа", ...features.map((feature) => feature.name)];
  const coefficients = estimates.map((estimate, index) => {
    const standardError = Math.sqrt(Math.max(0, mse * inverse[index][index]));
    const tStatistic = standardError === 0
      ? estimate === 0 ? 0 : Number.POSITIVE_INFINITY
      : estimate / standardError;
    const pValue = Number.isFinite(tStatistic)
      ? 2 * (1 - jStat.studentt.cdf(Math.abs(tStatistic), df))
      : 0;
    return {
      name: names[index], estimate, standardError, tStatistic, pValue,
      lower: estimate - tCritical * standardError,
      upper: estimate + tCritical * standardError
    };
  });

  const safeRss = Math.max(rss, Number.EPSILON);
  const logLikelihood =
    -(n / 2) * (Math.log(2 * Math.PI) + 1 + Math.log(safeRss / n));
  const aic = -2 * logLikelihood + 2 * parameterCount;
  const bic = -2 * logLikelihood + parameterCount * Math.log(n);

  return {
    predictorColumns: features.map((feature) => feature.name),
    selectedPredictorColumns: predictorColumns,
    features,
    yColumn,
    n,
    rSquared,
    mse,
    aic,
    bic,
    coefficients,
    observations,
    designRows
  };
}

export function calculateVif(model: MultipleLinearRegressionModel) {
  return model.predictorColumns.map((name, targetIndex) => {
    const target = model.designRows.map((row) => row[targetIndex + 1]);
    const targetIsConstant = target.every((value) => value === target[0]);
    const design = model.designRows.map((row) => [
      1,
      ...row.slice(1).filter((_, index) => index !== targetIndex)
    ]);
    const rSquared = targetIsConstant
      ? 1
      : calculateAuxiliaryRSquared(design, target);
    return { name, vif: rSquared >= 1 ? Number.POSITIVE_INFINITY : 1 / (1 - rSquared) };
  });
}

export function runMultipleLinearRegression(
  dataset: Dataset,
  settings: Record<string, unknown>
): CalculationResult {
  const model = calculateMultipleLinearRegression(dataset, settings);
  const significant = model.coefficients.every((item) => item.pValue < 0.05);
  const intervalsExcludeZero = model.coefficients.every(
    (item) => item.lower > 0 || item.upper < 0
  );
  const coefficientInterpretations = model.coefficients.slice(1).map((item, index) => {
    const feature = model.features[index];
    if (feature.kind === "categorical") {
      return `Коэффициент для категории «${feature.category}» переменной «${feature.sourceColumn}» составил ${round(item.estimate, 4)}: по сравнению с базовой категорией «${feature.baseline}» значение «${model.yColumn}» при прочих равных ${item.estimate >= 0 ? "выше" : "ниже"} на ${round(Math.abs(item.estimate), 2)} единицы.`;
    }
    return `Коэффициент для «${item.name}» составил ${round(item.estimate, 4)}: при росте предиктора на 1 единицу значение «${model.yColumn}» при прочих равных ${item.estimate >= 0 ? "вырастет" : "снизится"} на ${round(Math.abs(item.estimate), 2)} единицы.`;
  });
  const narrative = [
    `R² составил ${round(model.rSquared, 4)}, то есть ${(model.rSquared * 100).toFixed(1)}% вариации зависимой переменной «${model.yColumn}» объясняют включённые в модель предикторы.`,
    `Коэффициенты модели ${significant ? "статистически значимы" : "не все статистически значимы"}. Доверительные интервалы ${intervalsExcludeZero ? "не пересекают" : "пересекают"} ноль.`,
    `Константа составила ${round(model.coefficients[0].estimate, 4)}: при нулевых значениях всех предикторов прогноз «${model.yColumn}» составит ${round(model.coefficients[0].estimate, 2)}.`,
    ...coefficientInterpretations
  ].join("\n\n");
  const predictionRows = model.observations.map((item) => ({
    ...item.sourceValues,
    [model.yColumn]: item.actual,
    Прогноз: round(item.predicted, 6),
    Остаток: round(item.residual, 6)
  }));
  const formula = `ŷ = ${round(model.coefficients[0].estimate, 4)}${model.coefficients.slice(1).map((item) => ` ${item.estimate < 0 ? "−" : "+"} ${round(Math.abs(item.estimate), 4)} · ${item.name}`).join("")}`;

  return createCalculationResult([
    {
      type: "table", title: "Коэффициенты модели",
      columns: ["Коэффициент", "Оценка", "Стандартная ошибка", "t", "p-value", "CI 2.5%", "CI 97.5%"],
      rows: model.coefficients.map((item) => ({
        Коэффициент: item.name, Оценка: round(item.estimate, 4),
        "Стандартная ошибка": round(item.standardError, 4), t: round(item.tStatistic, 4),
        "p-value": round(item.pValue, 6), "CI 2.5%": round(item.lower, 4), "CI 97.5%": round(item.upper, 4)
      })), actions: []
    },
    {
      type: "table", title: "Метрики модели", columns: ["Показатель", "Значение"],
      rows: [
        { Показатель: "R²", Значение: round(model.rSquared, 4) },
        { Показатель: "MSE", Значение: round(model.mse, 4) },
        { Показатель: "AIC", Значение: round(model.aic, 4) },
        { Показатель: "BIC", Значение: round(model.bic, 4) }
      ], actions: []
    },
    { type: "text", title: "Вывод", content: narrative, actions: [] },
    { type: "formula", title: "Формула модели", content: formula, actions: [] },
    {
      type: "table", title: "Прогнозы и остатки",
      columns: [...model.selectedPredictorColumns, model.yColumn, "Прогноз", "Остаток"],
      rows: predictionRows.slice(0, 20), exportRows: predictionRows,
      downloadFileName: `${dataset.fileName.replace(/\.[^.]+$/, "")}_прогнозы_и_остатки`,
      actions: ["downloadCsv"]
    }
  ]);
}
