import { useRef, useState } from "react";
import type { Dataset } from "../../types/dataset";
import { parseFile } from "../../lib/fileParser";

type FileUploaderProps = {
  onLoaded: (dataset: Dataset) => void;
};

export function FileUploader({ onLoaded }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsLoading(true);
    setLocalError(null);

    try {
      const dataset = await parseFile(file);
      onLoaded(dataset);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Не удалось прочитать файл."
      );
    } finally {
      setIsLoading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="uploader">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileChange}
      />

      {isLoading && <p className="muted">Читаю файл...</p>}
      {localError && <div className="error-box">{localError}</div>}
    </div>
  );
}