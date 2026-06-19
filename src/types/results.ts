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
    };