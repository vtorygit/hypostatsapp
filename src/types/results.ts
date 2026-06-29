export type ResultMetadata = {
  title: string;
  description: string;
  source: string;
  createdAt: string;
  toolId: string;
  toolTitle: string;
};

export type ResultBlockAction =
  | "copy"
  | "downloadCsv"
  | "downloadXlsx"
  | "downloadPng";

type ResultBlockBase = {
  title: string;
  actions?: ResultBlockAction[];
};

export type ResultBlock =
  | (ResultBlockBase & {
      type: "text";
      content: string;
    })
  | (ResultBlockBase & {
      type: "formula";
      content: string;
    })
  | (ResultBlockBase & {
      type: "table";
      columns: string[];
      rows: Array<Record<string, string | number>>;
      exportRows?: Array<Record<string, string | number>>;
      downloadFileName?: string;
      presentation?: "table" | "tags";
    })
  | (ResultBlockBase & {
      type: "image";
      src: string;
      alt: string;
      fileName?: string;
    });

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
