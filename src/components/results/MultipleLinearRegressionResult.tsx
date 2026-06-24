import { useMemo, useState } from "react";
import { jStat } from "jstat";
import type { ToolResultProps } from "../../types/tools";
import { copyText, downloadCsv } from "../../lib/exports";
import { pearson, round } from "../../lib/statistics";
import { CorrelationHeatmap } from "../charts/CorrelationHeatmap";
import {
  calculateMultipleLinearRegression,
  type MultipleLinearRegressionModel
} from "../../tools/regression/multipleLinearRegression";
import {
  calculateBreuschPagan,
  calculatePairwisePredictorCorrelations,
  calculateShapiroWilkApproximation,
  calculateVif
} from "../../tools/regression/regressionDiagnostics";

type DiagnosticId =
  | "linearity"
  | "correlations"
  | "correlationHeatmap"
  | "vif"
  | "residualPlot"
  | "breuschPagan"
  | "histogram"
  | "qqPlot"
  | "shapiroWilk";

const DIAGNOSTIC_GROUPS: Array<{
  title: string;
  description: string;
  options: Array<{ id: DiagnosticId; label: string }>;
}> = [
  {
    title: "Линейность",
    description: "Сравнение фактических и предсказанных значений с диагональю идеального совпадения.",
    options: [{ id: "linearity", label: "Проверить визуально" }]
  },
  {
    title: "Отсутствие мультиколлинеарности",
    description: "Проверка взаимосвязей между предикторами. При одном предикторе VIF равен 1.",
    options: [
      { id: "correlations", label: "Парные корреляции" },
      { id: "correlationHeatmap", label: "Корреляционная матрица — heatmap" },
      { id: "vif", label: "VIF" }
    ]
  },
  {
    title: "Гомоскедастичность",
    description: "Проверка постоянства разброса остатков во всём диапазоне прогнозов.",
    options: [
      { id: "residualPlot", label: "График остатков" },
      { id: "breuschPagan", label: "Тест Бройша–Пагана" }
    ]
  },
  {
    title: "Нормальность распределения остатков",
    description: "Визуальные и формальные способы проверки распределения остатков.",
    options: [
      { id: "histogram", label: "Гистограмма" },
      { id: "qqPlot", label: "QQ-график" },
      { id: "shapiroWilk", label: "Тест Шапиро–Уилка" }
    ]
  }
];

function ScatterChart({ points, xLabel, yLabel, diagonal = false }: {
  points: Array<{ x: number; y: number }>;
  xLabel: string;
  yLabel: string;
  diagonal?: boolean;
}) {
  const width = 560; const height = 260; const padding = 34;
  const xs = points.map((point) => point.x); const ys = points.map((point) => point.y);
  const minX = Math.min(...xs); const maxX = Math.max(...xs);
  const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const scaleX = (value: number) => padding + ((value - minX) / (maxX - minX || 1)) * (width - padding * 2);
  const scaleY = (value: number) => height - padding - ((value - minY) / (maxY - minY || 1)) * (height - padding * 2);
  const diagonalMin = Math.min(minX, minY); const diagonalMax = Math.max(maxX, maxY);

  return <div className="diagnostic-chart"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${yLabel} по ${xLabel}`}>
    <line className="chart-axis" x1={padding} y1={height - padding} x2={width - padding} y2={height - padding}/>
    <line className="chart-axis" x1={padding} y1={padding} x2={padding} y2={height - padding}/>
    {diagonal && <line className="chart-reference" x1={scaleX(diagonalMin)} y1={scaleY(diagonalMin)} x2={scaleX(diagonalMax)} y2={scaleY(diagonalMax)}/>} 
    {!diagonal && <line className="chart-reference" x1={padding} y1={scaleY(0)} x2={width - padding} y2={scaleY(0)}/>} 
    {points.map((point, index) => <circle key={index} cx={scaleX(point.x)} cy={scaleY(point.y)} r="3"/>)}
  </svg><div className="chart-labels"><span>{xLabel}</span><span>{yLabel}</span></div></div>;
}

function Histogram({ values }: { values: number[] }) {
  const binCount = Math.min(12, Math.max(5, Math.ceil(Math.sqrt(values.length))));
  const min = Math.min(...values); const max = Math.max(...values); const width = (max - min || 1) / binCount;
  const bins = Array.from({ length: binCount }, () => 0);
  values.forEach((value) => { bins[Math.min(binCount - 1, Math.floor((value - min) / width))] += 1; });
  const maxCount = Math.max(...bins);
  return <div className="diagnostic-chart"><svg viewBox="0 0 560 260" role="img" aria-label="Гистограмма остатков">
    {bins.map((count, index) => {
      const barWidth = 490 / binCount;
      const barHeight = (count / maxCount) * 190;
      return <rect key={index} x={35 + index * barWidth} y={225 - barHeight} width={barWidth - 2} height={barHeight}/>;
    })}
    <line className="chart-axis" x1="34" y1="226" x2="528" y2="226"/>
  </svg><div className="chart-labels"><span>Остатки</span><span>Частота</span></div></div>;
}

function QqPlot({ values }: { values: number[] }) {
  const sorted = [...values].sort((a, b) => a - b);
  const points = sorted.map((value, index) => ({
    x: jStat.normal.inv((index + 0.5) / sorted.length, 0, 1),
    y: value
  }));
  return <ScatterChart points={points} xLabel="Теоретические квантили" yLabel="Остатки" diagonal />;
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return <div className="regression-metric"><span>{label}</span><strong>{Number.isFinite(value) ? value.toFixed(2) : "—"}</strong></div>;
}

function texName(name: string) {
  return `\\mathrm{${name.replaceAll("_", "\\_")}}`;
}

export function MultipleLinearRegressionResult({ result, dataset, settings }: ToolResultProps) {
  const [selected, setSelected] = useState<DiagnosticId[]>([]);
  const [completed, setCompleted] = useState<DiagnosticId[]>([]);
  const model = useMemo(
    () => dataset ? calculateMultipleLinearRegression(dataset, settings) : null,
    [dataset, settings]
  );
  if (!model) return <div className="error-box">Не удалось восстановить данные модели.</div>;

  const coefficientBlock = result.blocks.find((block) => block.type === "table" && block.title === "Коэффициенты модели");
  const narrative = result.blocks.find((block) => block.type === "text" && block.title === "Вывод");
  const formula = result.blocks.find((block) => block.type === "formula" && block.title === "Формула модели");
  const predictions = result.blocks.find((block) => block.type === "table" && block.title === "Прогнозы и остатки");
  const texFormula = `\\hat{${texName(model.yColumn)}} = ${round(model.coefficients[0].estimate, 4)}${model.coefficients.slice(1).map((item) => ` ${item.estimate < 0 ? "-" : "+"} ${round(Math.abs(item.estimate), 4)} \\cdot ${texName(item.name)}`).join("")}`;
  const residuals = model.observations.map((item) => item.residual);
  const bp = calculateBreuschPagan(model);
  const shapiro = calculateShapiroWilkApproximation(residuals);
  const correlations = calculatePairwisePredictorCorrelations(model);
  const vif = calculateVif(model);
  const predictorHeatmap = model.predictorColumns.map((_, rowIndex) =>
    model.predictorColumns.map((__, columnIndex) =>
      pearson(
        model.designRows.map((row) => row[rowIndex + 1]),
        model.designRows.map((row) => row[columnIndex + 1])
      )
    )
  );
  const categoricalEncodings = model.features.filter(
    (feature, index, all) =>
      feature.kind === "categorical" &&
      all.findIndex((item) => item.sourceColumn === feature.sourceColumn) === index
  );
  const toggle = (id: DiagnosticId) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <div className="regression-report">
    <div className="regression-overview">
      <div className="content-card regression-coefficients">
        <h2>Коэффициенты</h2>
        {categoricalEncodings.length > 0 && (
          <div className="regression-encoding-note">
            {categoricalEncodings.map((feature) => (
              <span key={feature.sourceColumn}>
                {feature.sourceColumn}: базовая категория — {feature.baseline}
              </span>
            ))}
          </div>
        )}
        {coefficientBlock?.type === "table" && <div className="table-scroll"><table><thead><tr>{coefficientBlock.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{coefficientBlock.rows.map((row, index) => <tr key={index}>{coefficientBlock.columns.map((column) => <td key={column}>{String(row[column] ?? "")}</td>)}</tr>)}</tbody></table></div>}
      </div>
      <div className="regression-metrics"><MetricCard label="R²" value={model.rSquared}/><MetricCard label="MSE" value={model.mse}/><MetricCard label="AIC" value={model.aic}/><MetricCard label="BIC" value={model.bic}/></div>
    </div>

    {narrative?.type === "text" && <div className="content-card regression-narrative"><h2>Вывод</h2><p>{narrative.content}</p></div>}

    {formula?.type === "formula" && <div className="content-card regression-formula"><div><p className="eyebrow">Формула модели</p><strong>{formula.content}</strong></div><button className="secondary-button" onClick={() => copyText(texFormula)}>Скопировать в TeX</button></div>}

    <div className="content-card regression-diagnostics"><div className="regression-section-heading"><div><p className="eyebrow">Диагностика</p><h2>Проверка предпосылок модели</h2></div><button className="primary-button" disabled={selected.length === 0} onClick={() => setCompleted(selected)}>Проверить выбранное</button></div>
      <div className="diagnostic-options">{DIAGNOSTIC_GROUPS.map((group) => <fieldset key={group.title}><legend>{group.title}</legend><p>{group.description}</p>{group.options.map((option) => <label key={option.id}><input type="checkbox" checked={selected.includes(option.id)} onChange={() => toggle(option.id)}/><span>{option.label}</span></label>)}</fieldset>)}</div>
    </div>

    {completed.length > 0 && <div className="diagnostic-results">
      {completed.includes("linearity") && <div className="content-card"><h3>Линейность</h3><ScatterChart points={model.observations.map((item) => ({ x: item.predicted, y: item.actual }))} xLabel="Предсказанные значения" yLabel="Фактические значения" diagonal/><p>Чем ближе точки к диагонали, тем лучше линейная модель воспроизводит наблюдаемые значения.</p></div>}
      {completed.includes("correlations") && <div className="content-card"><h3>Парные корреляции предикторов</h3>{correlations.length === 0 ? <p>В модели один предиктор: парные корреляции между предикторами отсутствуют.</p> : <div className="table-scroll"><table><thead><tr><th>Предиктор 1</th><th>Предиктор 2</th><th>r</th></tr></thead><tbody>{correlations.map((item) => <tr key={`${item.first}-${item.second}`}><td>{item.first}</td><td>{item.second}</td><td>{round(item.correlation, 4)}</td></tr>)}</tbody></table></div>}</div>}
      {completed.includes("correlationHeatmap") && <div className="content-card diagnostic-result-wide"><h3>Корреляционная матрица предикторов</h3><CorrelationHeatmap labels={model.predictorColumns} matrix={predictorHeatmap}/></div>}
      {completed.includes("vif") && <div className="content-card"><h3>VIF</h3><div className="table-scroll"><table><thead><tr><th>Предиктор</th><th>VIF</th><th>Интерпретация</th></tr></thead><tbody>{vif.map((item) => <tr key={item.name}><td>{item.name}</td><td>{Number.isFinite(item.vif) ? round(item.vif, 4) : "∞"}</td><td>{item.vif < 5 ? "Проблем обычно нет" : item.vif <= 10 ? "Стоит обратить внимание" : "Выраженная мультиколлинеарность"}</td></tr>)}</tbody></table></div></div>}
      {completed.includes("residualPlot") && <div className="content-card"><h3>График остатков</h3><ScatterChart points={model.observations.map((item) => ({ x: item.predicted, y: item.residual }))} xLabel="Предсказанные значения" yLabel="Остатки"/><p>Равномерное облако вокруг нуля поддерживает предпосылку гомоскедастичности; форма воронки указывает на возможное нарушение.</p></div>}
      {completed.includes("breuschPagan") && <div className="content-card"><h3>Тест Бройша–Пагана</h3><p>LM = {round(bp.statistic, 4)}, df = {bp.df}, p-value = {round(bp.pValue, 6)}.</p><p>{bp.pValue > 0.05 ? "Оснований считать гомоскедастичность нарушенной нет." : "Есть признаки гетероскедастичности."}</p></div>}
      {completed.includes("histogram") && <div className="content-card"><h3>Гистограмма остатков</h3><Histogram values={residuals}/></div>}
      {completed.includes("qqPlot") && <div className="content-card"><h3>QQ-график</h3><QqPlot values={residuals}/><p>Близость точек к диагонали соответствует распределению остатков, близкому к нормальному.</p></div>}
      {completed.includes("shapiroWilk") && <div className="content-card"><h3>Тест Шапиро–Уилка</h3><p>W = {round(shapiro.statistic, 4)}, p-value = {round(shapiro.pValue, 6)}.</p><p>{shapiro.pValue < 0.05 ? "Остатки нельзя считать распределёнными нормально." : "Нет оснований отвергать предположение о нормальности остатков."}</p><p className="form-hint">В браузерной версии используется численная аппроксимация теста.</p></div>}
    </div>}

    {predictions?.type === "table" && <div className="regression-download"><button className="primary-button" onClick={() => downloadCsv(predictions.exportRows ?? predictions.rows, predictions.columns, `${predictions.downloadFileName ?? "прогнозы_и_остатки"}.csv`)}>Прогнозы и остатки скачать</button></div>}
  </div>;
}
