import type { Dataset } from "./dataset";
import type { ResultBlock } from "./results";

export type ToolGroupId =
  | "data-preparation"
  | "hypothesis-testing"
  | "relationships"
  | "regression"
  | "calculators";

export type ToolInputMode = "dataset" | "calculator";

export type ToolDefinition = {
  id: string;
  title: string;
  groupId: ToolGroupId;
  description: string;
  tokenCost: number;
  inputMode: ToolInputMode;
  run?: (dataset: Dataset, settings: Record<string, unknown>) => ResultBlock[];
};