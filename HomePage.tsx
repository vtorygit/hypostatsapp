import { Link } from "react-router-dom";
import { toolGroups } from "../tools/groups";
import { getToolsByGroup } from "../tools/registry";
import { Card } from "../components/ui/Card";
import { ToolPreview } from "../components/home/ToolPreview";

function getToolCountLabel(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} инструментов`;
  }

  if (lastDigit === 1) {
    return `${count} инструмент`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} инструмента`;
  }

  return `${count} инструментов`;
}

export function HomePage() {
  return (
    <section className="page home-page">
      <div className="bento-grid">
        <Card variant="hero" className="bento-hero">
          <div className="hero-topline">
            <span className="hero-index">01 / RESEARCH WORKSPACE</span>
            <span>v0.1.0</span>
          </div>

          <div className="hero-copy">
            <p className="eyebrow">Статистика без кода</p>
            <h1>Research<br />Toolbox</h1>
            <p className="hero-description">
              От исследовательского вопроса к понятному результату — без R,
              Python, SPSS и ручных формул в Excel.
            </p>
          </div>

          <div className="hero-footer">
            <div className="hero-facts">
              <span>CSV / XLSX</span>
              <span>Privacy by design.</span>
              <span>Файлы остаются на вашем устройстве.</span>
              <span>Сервер не участвует в анализе.</span>
            </div>
          </div>
        </Card>

        {toolGroups.map((group, index) => {
          const count = getToolsByGroup(group.id).length;

          return (
            <Card
              key={group.id}
              as={Link}
              to={`/groups/${group.id}`}
              variant="tool"
              className={`bento-tool bento-tool--${group.id}`}
            >
              <div className="tool-card-topline">
                <span>0{index + 2}</span>
                <span>{getToolCountLabel(count)}</span>
              </div>
              <ToolPreview groupId={group.id} />
              <div className="tool-card-copy">
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <span className="tool-card-arrow" aria-hidden="true">→</span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
