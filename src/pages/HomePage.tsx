import { Link } from "react-router-dom";
import { toolGroups } from "../tools/groups";

export function HomePage() {
  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">Тулбокс исследователя</p>
        <h1>Выберите группу инструментов</h1>
        <p>
          Загрузите данные, настройте анализ и получите результат без R, Python,
          SPSS и ручных расчётов в Excel.
        </p>
      </div>

      <div className="card-grid">
        {toolGroups.map((group) => (
          <Link key={group.id} to={`/groups/${group.id}`} className="tool-card">
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}