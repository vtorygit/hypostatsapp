import type { ToolDefinition } from "../types/tools";
import { runOneProportionZTest } from "./hypothesis/oneProportionZTest";
import { runSampleSizeProportionCalculator } from "./calculators/sampleSizeProportion";

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
    id: "sample-size-proportion",
    title: "Размер выборки для оценки доли",
    groupId: "calculators",
    description:
      "Помогает рассчитать минимальный размер выборки для оценки доли с заданной погрешностью.",
    tokenCost: 2,
    inputMode: "calculator",
    runCalculator: runSampleSizeProportionCalculator
  }
];

export function getToolsByGroup(groupId: string | undefined): ToolDefinition[] {
  return tools.filter((tool) => tool.groupId === groupId);
}

export function getToolById(toolId: string | undefined): ToolDefinition | undefined {
  return tools.find((tool) => tool.id === toolId);
}
