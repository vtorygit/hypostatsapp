import { Link } from "react-router-dom";
import { toolGroups } from "../tools/groups";
import { getToolsByGroup } from "../tools/registry";
import { Card } from "../components/ui/Card";
import { ToolPreview } from "../components/home/ToolPreview";
import { TokenBadge } from "../components/tokens/TokenBadge";

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
              <span>Вычисления в браузере</span>
              <span>Данные не загружаются</span>
            </div>
            <TokenBadge />
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
                <span>{count} {count === 1 ? "инструмент" : "инструментов"}</span>
              </div>
              <ToolPreview groupId={group.id} />
              <div className="tool-card-copy">
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <span className="tool-card-arrow" aria-hidden="true">↗</span>
            </Card>
          );
        })}

        <Card className="bento-note">
          <span className="status-dot" />
          <div>
            <strong>Privacy by design</strong>
            <p>Файлы остаются на вашем устройстве. Сервер не участвует в анализе.</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
