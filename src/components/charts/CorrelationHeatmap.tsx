type CorrelationHeatmapProps = {
  labels: string[];
  matrix: number[][];
};

function mixChannel(start: number, end: number, amount: number) {
  return Math.round(start + (end - start) * amount);
}

function mixColor(start: [number, number, number], end: [number, number, number], amount: number) {
  return `rgb(${mixChannel(start[0], end[0], amount)} ${mixChannel(start[1], end[1], amount)} ${mixChannel(start[2], end[2], amount)})`;
}

function cellStyle(value: number) {
  if (!Number.isFinite(value)) {
    return { background: "#f4f4f0", color: "#686865" };
  }

  const clamped = Math.max(-1, Math.min(1, value));
  const intensity = Math.abs(clamped);
  const neutral: [number, number, number] = [248, 250, 252];
  const blue: [number, number, number] = [37, 99, 235];
  const red: [number, number, number] = [220, 38, 38];

  return {
    background: clamped < 0
      ? mixColor(neutral, blue, intensity)
      : mixColor(neutral, red, intensity),
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
