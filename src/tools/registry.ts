import type { ToolDefinition } from "../types/tools";
import { runOneProportionZTest } from "./hypothesis/oneProportionZTest";
import { runTwoProportionsZTest } from "./hypothesis/twoProportionsZTest";
import { runOneSampleTTest } from "./hypothesis/oneSampleTTest";
import { runIndependentSamplesTTest } from "./hypothesis/independentSamplesTTest";
import { runPairedSamplesTTest } from "./hypothesis/pairedSamplesTTest";
import { runChiSquareIndependenceTest } from "./hypothesis/chiSquareIndependenceTest";
import { runChiSquareGoodnessOfFitTest } from "./hypothesis/chiSquareGoodnessOfFitTest";
import { runPearsonCorrelation } from "./relationships/pearsonCorrelation";
import { runSpearmanCorrelation } from "./relationships/spearmanCorrelation";
import { runSampleSizeProportionCalculator } from "./calculators/sampleSizeProportion";
import { runZCriticalValueCalculator } from "./calculators/zCriticalValue";
import { runZPValueCalculator } from "./calculators/zPValue";
import { OneProportionZTestForm } from "../components/tools/OneProportionZTestForm";
import { TwoProportionsZTestForm } from "../components/tools/TwoProportionsZTestForm";
import { OneSampleTTestForm } from "../components/tools/OneSampleTTestForm";
import { IndependentSamplesTTestForm } from "../components/tools/IndependentSamplesTTestForm";
import { PairedSamplesTTestForm } from "../components/tools/PairedSamplesTTestForm";
import { ChiSquareIndependenceForm } from "../components/tools/ChiSquareIndependenceForm";
import { ChiSquareGoodnessOfFitForm } from "../components/tools/ChiSquareGoodnessOfFitForm";
import { CorrelationForm } from "../components/tools/CorrelationForm";
import { SampleSizeProportionForm } from "../components/tools/SampleSizeProportionForm";
import { ZCriticalValueForm } from "../components/tools/ZCriticalValueForm";
import { ZPValueForm } from "../components/tools/ZPValueForm";
import { runDataPreview, runMissingValues, runDuplicatesCheck, runCategoryRecode } from "./dataPreparation/dataPreparation";
import { DataPreviewForm, MissingValuesForm, DuplicatesCheckForm, CategoryRecodeForm } from "../components/tools/DataPreparationForms";
import { runSampleSizeMean, runConfidenceIntervalMean, runConfidenceIntervalProportion, runCohensD } from "./calculators/advancedCalculators";
import { SampleSizeMeanForm, ConfidenceIntervalMeanForm, ConfidenceIntervalProportionForm, CohensDForm } from "../components/tools/AdvancedCalculatorForms";
import { runCorrelationMatrix } from "./relationships/correlationMatrix";
import { CorrelationMatrixForm } from "../components/tools/CorrelationMatrixForm";
import { runSimpleLinearRegression } from "./regression/simpleLinearRegression";
import { SimpleLinearRegressionForm } from "../components/tools/SimpleLinearRegressionForm";
import { runMannWhitneyUTest, runWilcoxonSignedRankTest, runKruskalWallisTest, runSignTest } from "./hypothesis/nonparametricTests";
import { MannWhitneyForm, WilcoxonSignedRankForm, KruskalWallisForm, SignTestForm } from "../components/tools/NonparametricForms";

export const tools: ToolDefinition[] = [
  {
    id: "data-preview", title: "Просмотр данных", groupId: "data-preparation",
    description: "Показывает структуру и первые 10 строк загруженного файла.", tokenCost: 1,
    inputMode: "dataset", formComponent: DataPreviewForm, run: runDataPreview
  },
  {
    id: "missing-values", title: "Пропуски в данных", groupId: "data-preparation",
    description: "Считает количество и долю пропусков по каждому столбцу.", tokenCost: 2,
    inputMode: "dataset", formComponent: MissingValuesForm, run: runMissingValues
  },
  {
    id: "duplicates-check", title: "Дубликаты", groupId: "data-preparation",
    description: "Находит полностью совпадающие строки и оценивает их долю.", tokenCost: 2,
    inputMode: "dataset", formComponent: DuplicatesCheckForm, run: runDuplicatesCheck
  },
  {
    id: "category-recode", title: "Перекодировка категорий", groupId: "data-preparation",
    description: "Заменяет значения категорий и создаёт новую таблицу для экспорта.", tokenCost: 3,
    inputMode: "dataset", formComponent: CategoryRecodeForm, run: runCategoryRecode
  },
  {
    id: "one-proportion-z-test",
    title: "Z-тест для одной доли",
    groupId: "hypothesis-testing",
    description:
      "Проверяет, отличается ли наблюдаемая доля от заданного значения.",
    tokenCost: 5,
    inputMode: "dataset",
    formComponent: OneProportionZTestForm,
    run: runOneProportionZTest
  },
  {
    id: "two-proportions-z-test",
    title: "Z-тест для двух долей",
    groupId: "hypothesis-testing",
    description:
      "Проверяет, различаются ли доли признака в двух независимых группах.",
    tokenCost: 7,
    inputMode: "dataset",
    formComponent: TwoProportionsZTestForm,
    run: runTwoProportionsZTest
  },
  {
    id: "one-sample-t-test",
    title: "t-тест для одной выборки",
    groupId: "hypothesis-testing",
    description:
      "Проверяет, отличается ли среднее значение числовой переменной от заданной константы.",
    tokenCost: 5,
    inputMode: "dataset",
    formComponent: OneSampleTTestForm,
    run: runOneSampleTTest
  },
  {
    id: "independent-samples-t-test",
    title: "t-тест для независимых выборок",
    groupId: "hypothesis-testing",
    description:
      "Сравнивает средние значения числовой переменной в двух независимых группах.",
    tokenCost: 7,
    inputMode: "dataset",
    formComponent: IndependentSamplesTTestForm,
    run: runIndependentSamplesTTest
  },
  {
    id: "paired-samples-t-test",
    title: "Парный t-тест",
    groupId: "hypothesis-testing",
    description:
      "Сравнивает два связанных измерения: например, значение до и после.",
    tokenCost: 7,
    inputMode: "dataset",
    formComponent: PairedSamplesTTestForm,
    run: runPairedSamplesTTest
  },
  {
    id: "chi-square-independence-test",
    title: "χ²-критерий независимости",
    groupId: "hypothesis-testing",
    description:
      "Проверяет, есть ли статистически значимая связь между двумя категориальными переменными.",
    tokenCost: 7,
    inputMode: "dataset",
    formComponent: ChiSquareIndependenceForm,
    run: runChiSquareIndependenceTest
  },
  {
    id: "chi-square-goodness-of-fit-test",
    title: "χ²-критерий согласия",
    groupId: "hypothesis-testing",
    description:
      "Проверяет, отличается ли наблюдаемое распределение одной категориальной переменной от ожидаемого.",
    tokenCost: 7,
    inputMode: "dataset",
    formComponent: ChiSquareGoodnessOfFitForm,
    run: runChiSquareGoodnessOfFitTest
  },
  {
    id: "mann-whitney-u-test", title: "Критерий Манна–Уитни", groupId: "hypothesis-testing",
    description: "Сравнивает распределения числовой переменной в двух независимых группах.", tokenCost: 7,
    inputMode: "dataset", formComponent: MannWhitneyForm, run: runMannWhitneyUTest
  },
  {
    id: "wilcoxon-signed-rank-test", title: "Критерий Уилкоксона", groupId: "hypothesis-testing",
    description: "Сравнивает два связанных измерения по рангам парных разностей.", tokenCost: 7,
    inputMode: "dataset", formComponent: WilcoxonSignedRankForm, run: runWilcoxonSignedRankTest
  },
  {
    id: "kruskal-wallis-test", title: "Критерий Краскела–Уоллиса", groupId: "hypothesis-testing",
    description: "Сравнивает распределения числовой переменной в двух и более группах.", tokenCost: 7,
    inputMode: "dataset", formComponent: KruskalWallisForm, run: runKruskalWallisTest
  },
  {
    id: "sign-test", title: "Критерий знаков", groupId: "hypothesis-testing",
    description: "Проверяет направление изменений между двумя парными измерениями.", tokenCost: 5,
    inputMode: "dataset", formComponent: SignTestForm, run: runSignTest
  },
  {
    id: "pearson-correlation",
    title: "Корреляция Пирсона",
    groupId: "relationships",
    description:
      "Оценивает линейную связь между двумя числовыми переменными.",
    tokenCost: 4,
    inputMode: "dataset",
    formComponent: CorrelationForm,
    run: runPearsonCorrelation
  },
  {
    id: "spearman-correlation",
    title: "Корреляция Спирмена",
    groupId: "relationships",
    description:
      "Оценивает монотонную связь между двумя переменными на основе рангов.",
    tokenCost: 4,
    inputMode: "dataset",
    formComponent: CorrelationForm,
    run: runSpearmanCorrelation
  },
  {
    id: "correlation-matrix", title: "Корреляционная матрица", groupId: "relationships",
    description: "Строит матрицу корреляций Пирсона или Спирмена для нескольких переменных.", tokenCost: 6,
    inputMode: "dataset", formComponent: CorrelationMatrixForm, run: runCorrelationMatrix
  },
  {
    id: "simple-linear-regression", title: "Простая линейная регрессия", groupId: "regression",
    description: "Оценивает линейную модель, коэффициенты, R², прогнозы и остатки.", tokenCost: 8,
    inputMode: "dataset", formComponent: SimpleLinearRegressionForm, run: runSimpleLinearRegression
  },
  {
    id: "sample-size-proportion",
    title: "Размер выборки для оценки доли",
    groupId: "calculators",
    description:
      "Помогает рассчитать минимальный размер выборки для оценки доли с заданной погрешностью.",
    tokenCost: 2,
    inputMode: "calculator",
    formComponent: SampleSizeProportionForm,
    run: runSampleSizeProportionCalculator
  },
  {
    id: "z-critical-value",
    title: "Критическое значение Z",
    groupId: "calculators",
    description:
      "Рассчитывает критическое значение стандартного нормального распределения для заданного α.",
    tokenCost: 1,
    inputMode: "calculator",
    formComponent: ZCriticalValueForm,
    run: runZCriticalValueCalculator
  },
  {
    id: "z-p-value",
    title: "p-value для Z-статистики",
    groupId: "calculators",
    description:
      "Рассчитывает p-value по наблюдаемой Z-статистике и типу альтернативы.",
    tokenCost: 1,
    inputMode: "calculator",
    formComponent: ZPValueForm,
    run: runZPValueCalculator
  },
  {
    id: "sample-size-mean", title: "Размер выборки для оценки среднего", groupId: "calculators",
    description: "Рассчитывает минимальный размер выборки по SD и допустимой погрешности.", tokenCost: 2,
    inputMode: "calculator", formComponent: SampleSizeMeanForm, run: runSampleSizeMean
  },
  {
    id: "confidence-interval-mean", title: "Доверительный интервал для среднего", groupId: "calculators",
    description: "Строит доверительный интервал среднего по t-распределению.", tokenCost: 2,
    inputMode: "calculator", formComponent: ConfidenceIntervalMeanForm, run: runConfidenceIntervalMean
  },
  {
    id: "confidence-interval-proportion", title: "Доверительный интервал для доли", groupId: "calculators",
    description: "Строит нормальный доверительный интервал для наблюдаемой доли.", tokenCost: 2,
    inputMode: "calculator", formComponent: ConfidenceIntervalProportionForm, run: runConfidenceIntervalProportion
  },
  {
    id: "cohens-d", title: "Cohen’s d", groupId: "calculators",
    description: "Рассчитывает стандартизированный размер эффекта между двумя группами.", tokenCost: 2,
    inputMode: "calculator", formComponent: CohensDForm, run: runCohensD
  }
];

export function getToolsByGroup(groupId: string | undefined): ToolDefinition[] {
  return tools.filter((tool) => tool.groupId === groupId);
}

export function getToolById(toolId: string | undefined): ToolDefinition | undefined {
  return tools.find((tool) => tool.id === toolId);
}
