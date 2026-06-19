import type { ToolGroupId } from "../types/tools";

export type ToolGroup = {
  id: ToolGroupId;
  title: string;
  description: string;
};

export const toolGroups: ToolGroup[] = [
  {
    id: "data-preparation",
    title: "Подготовка данных",
    description: "Просмотр данных, пропуски, дубликаты и перекодирование категорий."
  },
  {
    id: "hypothesis-testing",
    title: "Проверка гипотез",
    description: "Z-тесты, t-тесты, χ² и непараметрические критерии."
  },
  {
    id: "relationships",
    title: "Связь между переменными",
    description: "Корреляции, матрицы связи и проверка значимости."
  },
  {
    id: "regression",
    title: "Регрессия",
    description: "Линейная регрессия и базовая диагностика модели."
  },
  {
    id: "calculators",
    title: "Калькуляторы",
    description: "Критические значения, p-value, доверительные интервалы и размер выборки."
  }
];

export function getToolGroupById(id: string | undefined): ToolGroup | undefined {
  return toolGroups.find((group) => group.id === id);
}