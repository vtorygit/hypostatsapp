import { Link, useParams } from "react-router-dom";
import { getToolGroupById } from "../tools/groups";
import { getToolsByGroup } from "../tools/registry";
import { Card } from "../components/ui/Card";

export function ToolGroupPage() {
  const { groupId } = useParams();
  const group = getToolGroupById(groupId);
  const tools = getToolsByGroup(groupId);

  if (!group) {
    return (
      <section className="page narrow-page">
        <h1>Группа не найдена</h1>
        <Link to="/" className="text-link">
          Вернуться на главную
        </Link>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Группа инструментов</p>
        <h1>{group.title}</h1>
        <p>{group.description}</p>
      </div>

      {tools.length === 0 ? (
        <div className="empty-state">
          <h2>Инструменты скоро появятся</h2>
          <p>Эта группа уже заложена в архитектуру, но инструменты добавим позже.</p>
        </div>
      ) : (
        <div className="card-grid">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              as={Link}
              to={`/tools/${tool.id}`}
              variant="tool"
              className="tool-card"
            >
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
