export type ResultMetadata = {
  title: string;
  description: string;
  source: string;
  createdAt: string;
  toolId: string;
  toolTitle: string;
};

export type ResultBlock =
  | {
      type: "text";
      title: string;
      content: string;
    }
  | {
      type: "formula";
      title: string;
      content: string;
    }
  | {
      type: "table";
      title: string;
      columns: string[];
      rows: Array<Record<string, string | number>>;
    }
  | {
      type: "image";
      title: string;
      src: string;
      alt: string;
      fileName?: string;
    };

export type CalculationResult = {
  blocks: ResultBlock[];
};

export type AnalysisResult = CalculationResult & {
  metadata: ResultMetadata;
};

export function createCalculationResult(
  blocks: ResultBlock[]
): CalculationResult {
  return { blocks };
}
