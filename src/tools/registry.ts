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

export const tools: ToolDefinition[] = [
  {
    id: "one-proportion-z-test",
    title: "Z-тест для одной доли",
    groupId: "hypothesis-testing",
    description:
      "Проверяет, отличается ли наблюдаемая доля от заданного значения.",
    tokenCost: 5,
    inputMode: "dataset",
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
    run: runChiSquareGoodnessOfFitTest
  },
  {
    id: "pearson-correlation",
    title: "Корреляция Пирсона",
    groupId: "relationships",
    description:
      "Оценивает линейную связь между двумя числовыми переменными.",
    tokenCost: 4,
    inputMode: "dataset",
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
    run: runSpearmanCorrelation
  },
  {
    id: "sample-size-proportion",
    title: "Размер выборки для оценки доли",
    groupId: "calculators",
    description:
      "Помогает рассчитать минимальный размер выборки для оценки доли с заданной погрешностью.",
    tokenCost: 2,
    inputMode: "calculator",
    runCalculator: runSampleSizeProportionCalculator
  },
  {
    id: "z-critical-value",
    title: "Критическое значение Z",
    groupId: "calculators",
    description:
      "Рассчитывает критическое значение стандартного нормального распределения для заданного α.",
    tokenCost: 1,
    inputMode: "calculator",
    runCalculator: runZCriticalValueCalculator
  },
  {
    id: "z-p-value",
    title: "p-value для Z-статистики",
    groupId: "calculators",
    description:
      "Рассчитывает p-value по наблюдаемой Z-статистике и типу альтернативы.",
    tokenCost: 1,
    inputMode: "calculator",
    runCalculator: runZPValueCalculator
  }
];

export function getToolsByGroup(groupId: string | undefined): ToolDefinition[] {
  return tools.filter((tool) => tool.groupId === groupId);
}

export function getToolById(toolId: string | undefined): ToolDefinition | undefined {
  return tools.find((tool) => tool.id === toolId);
}
