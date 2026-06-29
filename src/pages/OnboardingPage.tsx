import { useNavigate } from "react-router-dom";
import { completeOnboarding } from "../lib/storage";

type OnboardingPageProps = {
  onComplete: () => void;
};

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const navigate = useNavigate();

  function handleComplete() {
    completeOnboarding();
    onComplete();
    navigate("/");
  }

  return (
    <section className="page narrow-page">
      <div className="hero-card">
        <p className="eyebrow">Перед началом</p>
        <h1>Как работает Research Toolbox</h1>

        <p>
          Это браузерный инструмент для базового исследовательского анализа:
          проверки гипотез, корреляций, регрессии и статистических
          калькуляторов.
        </p>

        <div className="info-list">
          <div>
            <h3>Данные не сохраняются</h3>
            <p>
              Файл обрабатывается в браузере. При переходе в другой инструмент
              анализ начинается заново.
            </p>
          </div>

          <div>
            <h3>Каждый инструмент начинается с загрузки</h3>
            <p>
              Один инструмент — одна страница и одна новая загрузка CSV/XLSX.
            </p>
          </div>

          <div>
            <h3>Есть ограничения по размеру</h3>
            <p>
              На старте поддерживаются файлы до 10 МБ, до 20 000 строк и до 100
              столбцов.
            </p>
          </div>
        </div>

        <button className="primary-button" onClick={handleComplete}>
          Перейти к инструментам
        </button>
      </div>
    </section>
  );
}
