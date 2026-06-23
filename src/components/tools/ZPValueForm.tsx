import { useState } from "react";

type ZPValueFormProps = {
  onRun: (settings: Record<string, unknown>) => void;
};

type Alternative = "two-sided" | "less" | "greater";

export function ZPValueForm({ onRun }: ZPValueFormProps) {
  const [z, setZ] = useState("");
  const [alpha, setAlpha] = useState("0.05");
  const [alternative, setAlternative] = useState<Alternative>("two-sided");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      z: Number(z),
      alpha: Number(alpha),
      alternative
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="z">Z-статистика</label>
        <input
          id="z"
          type="number"
          step="0.001"
          value={z}
          onChange={(event) => setZ(event.target.value)}
          placeholder="Например, -1.96"
          required
        />
      </div>

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
        <label htmlFor="alternative">Гипотеза</label>
        <select
          id="alternative"
          value={alternative}
          onChange={(event) => setAlternative(event.target.value as Alternative)}
        >
          <option value="two-sided">двусторонняя</option>
          <option value="less">левосторонняя</option>
          <option value="greater">правосторонняя</option>
        </select>
      </div>

      <button className="primary-button" type="submit">
        Рассчитать
      </button>
    </form>
  );
}
