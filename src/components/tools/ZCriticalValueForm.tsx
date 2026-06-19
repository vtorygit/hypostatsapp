import { useState } from "react";

type ZCriticalValueFormProps = {
  onRun: (settings: Record<string, unknown>) => void;
};

type TailType = "two-sided" | "left" | "right";

export function ZCriticalValueForm({ onRun }: ZCriticalValueFormProps) {
  const [alpha, setAlpha] = useState("0.05");
  const [tailType, setTailType] = useState<TailType>("two-sided");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      alpha: Number(alpha),
      tailType
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="alpha">Уровень значимости α</label>
        <input
          id="alpha"
          type="number"
          min="0.001"
          max="0.999"
          step="0.001"
          value={alpha}
          onChange={(event) => setAlpha(event.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="tailType">Тип критической области</label>
        <select
          id="tailType"
          value={tailType}
          onChange={(event) => setTailType(event.target.value as TailType)}
        >
          <option value="two-sided">Двусторонняя</option>
          <option value="left">Левосторонняя</option>
          <option value="right">Правосторонняя</option>
        </select>
      </div>

      <button className="primary-button" type="submit">
        Рассчитать
      </button>
    </form>
  );
}
