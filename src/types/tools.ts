import type { ComponentType } from "react";
import type { Dataset } from "./dataset";
import type { AnalysisResult, CalculationResult } from "./results";

export type ToolGroupId =
  | "data-preparation"
  | "hypothesis-testing"
  | "relationships"
  | "regression"
  | "calculators";

export type ToolInputMode = "dataset" | "calculator";

export type ToolFormProps = {
  onRun: (settings: Record<string, unknown>) => void;
};

export type DatasetToolFormProps = ToolFormProps & {
  dataset: Dataset;
};

export type ToolResultProps = {
  result: AnalysisResult;
  dataset: Dataset | null;
  settings: Record<string, unknown>;
};

type ToolDefinitionBase = {
  id: string;
  title: string;
  groupId: ToolGroupId;
  description: string;
  tokenCost: number;
  resultHint?: string;
  runOnUpload?: boolean;
  resultComponent?: ComponentType<ToolResultProps>;
  resultMetadataMode?: "default" | "fileOnly" | "hidden";
  resultHeaderAction?: "restart" | "downloadData" | "none";
};

export type DatasetToolDefinition = ToolDefinitionBase & {
  inputMode: "dataset";
  formComponent: ComponentType<DatasetToolFormProps>;
  run: (dataset: Dataset, settings: Record<string, unknown>) => CalculationResult;
  settingsLayout?: "split" | "full";
  settingsTitle?: string;
  showDatasetPreview?: boolean;
};

export type CalculatorToolDefinition = ToolDefinitionBase & {
  inputMode: "calculator";
  formComponent: ComponentType<ToolFormProps>;
  run: (settings: Record<string, unknown>) => CalculationResult;
};

export type ToolDefinition = DatasetToolDefinition | CalculatorToolDefinition;
