import type { ToolGroupId } from "../../types/tools";

type ToolPreviewProps = {
  groupId: ToolGroupId;
};

export function ToolPreview({ groupId }: ToolPreviewProps) {
  if (groupId === "hypothesis-testing") {
    return (
      <div className="tool-preview distribution-preview" aria-hidden="true">
        <svg viewBox="0 0 240 108">
          <path d="M8 91 C52 91, 67 88, 82 55 C95 26, 106 14, 120 14 C134 14, 145 26, 158 55 C173 88, 188 91, 232 91" />
          <line x1="178" y1="18" x2="178" y2="96" />
          <path className="preview-fill" d="M178 91 C189 91, 204 91, 232 91 L232 96 L178 96 Z" />
        </svg>
        <span>p = 0.032</span>
      </div>
    );
  }

  if (groupId === "relationships") {
    return (
      <div className="tool-preview scatter-preview" aria-hidden="true">
        <svg viewBox="0 0 240 108">
          <line x1="18" y1="94" x2="226" y2="94" />
          <line x1="18" y1="94" x2="18" y2="12" />
          <line className="trend-line" x1="30" y1="86" x2="216" y2="22" />
          {[["39","80"],["61","70"],["83","73"],["104","56"],["127","61"],["150","42"],["174","39"],["199","24"]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4" />
          ))}
        </svg>
        <span>r = 0.84</span>
      </div>
    );
  }

  if (groupId === "regression") {
    return (
      <div className="tool-preview regression-preview" aria-hidden="true">
        <div className="metric-preview">
          <small>MODEL FIT</small>
          <strong>R² 0.78</strong>
        </div>
        <svg viewBox="0 0 240 80">
          <path d="M10 66 C44 63, 69 55, 99 50 S158 33, 230 10" />
          <path className="confidence-band" d="M10 76 C54 67, 84 63, 111 54 S177 35, 230 20 L230 4 C178 20, 142 24, 103 38 S47 52, 10 57 Z" />
        </svg>
      </div>
    );
  }

  if (groupId === "data-preparation") {
    return (
      <div className="tool-preview data-preview-mini" aria-hidden="true">
        <div><span>ROWS</span><strong>20K</strong></div>
        <div><span>COLUMNS</span><strong>42</strong></div>
        <div><span>MISSING</span><strong>1.2%</strong></div>
      </div>
    );
  }

  return (
    <div className="tool-preview calculator-preview" aria-hidden="true">
      <span>SAMPLE SIZE</span>
      <strong>n = 385</strong>
      <div className="calculator-rule">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
