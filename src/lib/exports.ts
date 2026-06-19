export function copyText(text: string): void {
  navigator.clipboard.writeText(text);
}

export function downloadCsv(
  rows: Array<Record<string, string | number>>,
  columns: string[],
  fileName: string
): void {
  const header = columns.join(",");

  const body = rows
    .map((row) =>
      columns
        .map((column) => {
          const value = row[column] ?? "";
          const safe = String(value).replaceAll('"', '""');

          return `"${safe}"`;
        })
        .join(",")
    )
    .join("\n");

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  downloadBlob(blob, fileName);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}