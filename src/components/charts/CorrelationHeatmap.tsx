type CorrelationHeatmapProps = {
  labels: string[];
  matrix: number[][];
};

function cellStyle(value: number) {
  if (!Number.isFinite(value)) {
    return { background: "#f4f4f0", color: "#686865" };
  }

  const clamped = Math.max(-1, Math.min(1, value));
  const intensity = Math.abs(clamped);
  const hue = clamped < 0 ? 213 : 2;
  const saturation = 72;
  const lightness = 96 - intensity * 48;

  return {
    background: `hsl(${hue} ${saturation}% ${lightness}%)`,
    color: intensity > 0.62 ? "#ffffff" : "#111111"
  };
}

export function CorrelationHeatmap({ labels, matrix }: CorrelationHeatmapProps) {
  return (
    <div className="heatmap-wrapper">
      <div
        className="heatmap-grid"
        style={{ gridTemplateColumns: `minmax(96px, 1.15fr) repeat(${labels.length}, minmax(0, 1fr))` }}
      >
        <div className="heatmap-corner">Переменная</div>
        {labels.map((label) => <div className="heatmap-column-label" key={label}>{label}</div>)}
        {labels.map((rowLabel, rowIndex) => (
          <div className="heatmap-row" key={rowLabel}>
            <div className="heatmap-row-label">{rowLabel}</div>
            {matrix[rowIndex].map((value, columnIndex) => (
              <div
                className="heatmap-cell"
                key={`${rowLabel}-${labels[columnIndex]}`}
                style={cellStyle(value)}
                title={`${rowLabel} × ${labels[columnIndex]}: ${Number.isFinite(value) ? value.toFixed(4) : "нет данных"}`}
              >
                {Number.isFinite(value) ? value.toFixed(2) : "—"}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>−1</span><i /><span>0</span><span>+1</span>
      </div>
    </div>
  );
}
