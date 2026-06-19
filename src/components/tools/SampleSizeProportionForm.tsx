import { useState } from "react";

type SampleSizeProportionFormProps = {
  onRun: (settings: Record<string, unknown>) => void;
};

export function SampleSizeProportionForm({
  onRun
}: SampleSizeProportionFormProps) {
  const [confidenceLevel, setConfidenceLevel] = useState("0.95");
  const [marginOfError, setMarginOfError] = useState("0.05");
  const [expectedProportion, setExpectedProportion] = useState("0.5");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onRun({
      confidenceLevel: Number(confidenceLevel),
      marginOfError: Number(marginOfError),
      expectedProportion:
        expectedProportion.trim() === "" ? "" : Number(expectedProportion)
    });
  }

  return (
    <form className="tool-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="confidenceLevel">Уровень доверия</label>
        <select
          id="confidenceLevel"
          value={confidenceLevel}
          onChange={(event) => setConfidenceLevel(event.target.value)}
        >
          <option value="0.9">90%</option>
          <option value="0.95">95%</option>
          <option value="0.99">99%</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="marginOfError">Допустимая погрешность</label>
        <input
          id="marginOfError"
          type="number"
          min="0.001"
          max="0.999"
          step="0.001"
          value={marginOfError}
          onChange={(event) => setMarginOfError(event.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="expectedProportion">Ожидаемая доля</label>
        <input
          id="expectedProportion"
          type="number"
          min="0.001"
          max="0.999"
          step="0.001"
          value={expectedProportion}
          onChange={(event) => setExpectedProportion(event.target.value)}
          placeholder="Если неизвестно, оставьте 0.5"
        />
        <p className="form-hint">
          Если доля заранее неизвестна, обычно используют 0.5 — это даёт самый
          осторожный расчёт.
        </p>
      </div>

      <button className="primary-button" type="submit">
        Рассчитать
      </button>
    </form>
  );
}
