import type { ToolDefinition } from "../types/tools";
import { runOneProportionZTest } from "./hypothesis/oneProportionZTest";
import { runTwoProportionsZTest } from "./hypothesis/twoProportionsZTest";
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
