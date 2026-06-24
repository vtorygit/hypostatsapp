import { useMemo } from "react";
import type { ToolResultProps } from "../../types/tools";
import { CorrelationHeatmap } from "../charts/CorrelationHeatmap";
import {
  calculateCorrelationMatrix,
  type CorrelationMethod
} from "../../tools/relationships/correlationMatrix";

export function CorrelationHeatmapResult({ dataset, settings }: ToolResultProps) {
  const columns = Array.isArray(settings.columns) ? settings.columns.map(String) : [];
  const method: CorrelationMethod = settings.method === "spearman" ? "spearman" : "pearson";
  const matrix = useMemo(
    () => dataset ? calculateCorrelationMatrix(dataset, columns, method) : [],
    [dataset, columns.join("|"), method]
  );

  return (
    <div className="content-card heatmap-result">
      <div className="result-header">
        <div>
          <p className="eyebrow">{method === "pearson" ? "Корреляция Пирсона" : "Корреляция Спирмена"}</p>
          <h2>Тепловая диаграмма</h2>
        </div>
      </div>
      <CorrelationHeatmap labels={columns} matrix={matrix} />
      <p className="form-hint">Пропуски исключаются попарно для каждой пары переменных.</p>
    </div>
  );
}
