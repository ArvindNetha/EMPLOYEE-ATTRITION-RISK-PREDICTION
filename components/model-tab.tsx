"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtNum, humanFeatureName, MODEL } from "@/lib/data";
import { axisTick, ChartCard, ChartTooltip, COLORS, GRID } from "./chart-common";

export default function ModelTab() {
  const m = MODEL.metrics;

  const metrics = [
    { label: "Accuracy", value: (m.accuracy * 100).toFixed(1) + "%" },
    { label: "Precision", value: (m.precision * 100).toFixed(1) + "%" },
    { label: "Recall", value: (m.recall * 100).toFixed(1) + "%" },
    { label: "F1 Score", value: m.f1.toFixed(3) },
    { label: "ROC AUC", value: m.auc.toFixed(3) },
  ];

  const importance = useMemo(
    () =>
      MODEL.feature_names
        .map((f, i) => ({ name: humanFeatureName(f), coef: +MODEL.coef[i].toFixed(3) }))
        .sort((a, b) => Math.abs(b.coef) - Math.abs(a.coef))
        .slice(0, 14)
        .reverse(),
    [],
  );

  const roc = useMemo(() => MODEL.roc_points.map((p) => ({ fpr: p[0], tpr: p[1] })), []);

  const cm = m.confusion_matrix;

  return (
    <section className="tab-panel">
      <div className="metric-grid">
        {metrics.map((mt) => (
          <div className="metric-card" key={mt.label}>
            <div className="m-val">{mt.value}</div>
            <div className="m-label">{mt.label}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <ChartCard title="Feature Importance" sub="Standardized logistic-regression coefficients (top 14 by magnitude)" span={7} minHeight={420}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={importance} margin={{ top: 4, right: 20, left: 90, bottom: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#9BA6C0", fontSize: 10.5 }} tickLine={false} axisLine={false} width={150} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="coef" name="Coefficient" radius={[0, 3, 3, 0]} maxBarSize={16}>
                {importance.map((d, i) => (
                  <Cell key={i} fill={d.coef >= 0 ? COLORS.coral : COLORS.teal} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="ROC Curve" sub={`Model discrimination — AUC ${m.auc.toFixed(3)}`} span={5} minHeight={420}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart margin={{ top: 4, right: 16, left: -8, bottom: 4 }}>
              <CartesianGrid stroke={GRID} />
              <XAxis type="number" dataKey="fpr" domain={[0, 1]} tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} tickFormatter={(v) => v.toFixed(1)} label={{ value: "False Positive Rate", position: "insideBottom", offset: -2, fill: "#6b7593", fontSize: 11 }} />
              <YAxis type="number" domain={[0, 1]} tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(1)} />
              <Tooltip content={<ChartTooltip />} />
              <Line data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]} dataKey="tpr" stroke={COLORS.dim} strokeDasharray="5 5" dot={false} name="Baseline" strokeWidth={1.5} />
              <Line data={roc} dataKey="tpr" stroke={COLORS.amber} strokeWidth={2.5} dot={false} name="ROC" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Confusion Matrix" sub="Test-set predictions vs. actual outcomes" span={5}>
          <div className="cm-grid">
            <div className="cm-head" />
            <div className="cm-head">Pred: Stay</div>
            <div className="cm-head">Pred: Leave</div>
            <div className="cm-head" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", padding: "0 4px" }}>Actual: Stay</div>
            <div className="cm-cell cm-tn"><div className="cm-n">{fmtNum(cm[0][0])}</div><div className="cm-l">True Neg</div></div>
            <div className="cm-cell cm-fp"><div className="cm-n">{fmtNum(cm[0][1])}</div><div className="cm-l">False Pos</div></div>
            <div className="cm-head" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", padding: "0 4px" }}>Actual: Leave</div>
            <div className="cm-cell cm-fn"><div className="cm-n">{fmtNum(cm[1][0])}</div><div className="cm-l">False Neg</div></div>
            <div className="cm-cell cm-tp"><div className="cm-n">{fmtNum(cm[1][1])}</div><div className="cm-l">True Pos</div></div>
          </div>
        </ChartCard>

        <ChartCard title="Model Details" sub="Training configuration and dataset split" span={7}>
          <div className="info-list">
            <div className="info-row"><span>Algorithm</span><span>Logistic Regression</span></div>
            <div className="info-row"><span>Features used</span><span>{fmtNum(MODEL.feature_names.length)}</span></div>
            <div className="info-row"><span>Numeric features</span><span>{MODEL.num_cols.length}</span></div>
            <div className="info-row"><span>Categorical (one-hot)</span><span>{MODEL.cat_cols.length}</span></div>
            <div className="info-row"><span>Training samples</span><span>{fmtNum(m.train_size)}</span></div>
            <div className="info-row"><span>Test samples</span><span>{fmtNum(m.test_size)}</span></div>
            <div className="info-row"><span>Preprocessing</span><span>StandardScaler</span></div>
          </div>
        </ChartCard>
      </div>
    </section>
  );
}
