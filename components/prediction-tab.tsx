"use client";

import { useMemo, useState } from "react";
import { humanFeatureName, MODEL, uniqueSorted } from "@/lib/data";
import { predict, type PredictInput, type PredictResult } from "@/lib/predict";

const num = (field: string, fb: number) => (MODEL.num_medians[field] ?? fb);

export default function PredictionTab() {
  const catOptions = useMemo(
    () => ({
      Department: uniqueSorted("Department").map(String),
      Work_Mode: uniqueSorted("Work_Mode").map(String),
      Marital_Status: uniqueSorted("Marital_Status").map(String),
      EducationLevel: uniqueSorted("EducationLevel").map(String),
      Gender: uniqueSorted("Gender").map(String),
      City: uniqueSorted("City").map(String),
    }),
    [],
  );

  const [form, setForm] = useState<PredictInput>(() => ({
    Age: Math.round(num("Age", 35)),
    YearsAtCompany: Math.round(num("YearsAtCompany", 4)),
    TrainingHoursLastYear: Math.round(num("TrainingHoursLastYear", 20)),
    SatisfactionScore: Math.round(num("SatisfactionScore", 3)),
    PerformanceRating: Math.round(num("PerformanceRating", 3)),
    OverTime: false,
    Department: catOptions.Department[0] ?? "",
    Work_Mode: catOptions.Work_Mode[0] ?? "",
    Marital_Status: catOptions.Marital_Status[0] ?? "",
    EducationLevel: catOptions.EducationLevel[0] ?? "",
    Gender: catOptions.Gender[0] ?? "",
    City: catOptions.City[0] ?? "",
  }));

  const [result, setResult] = useState<PredictResult | null>(null);

  const set = <K extends keyof PredictInput>(k: K, v: PredictInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const run = () => setResult(predict(form));

  const verdict = useMemo(() => {
    if (!result) return null;
    const p = result.prob * 100;
    if (p >= 60) return { label: "High Risk", cls: "risk-high" };
    if (p >= 30) return { label: "Medium Risk", cls: "risk-medium" };
    return { label: "Low Risk", cls: "risk-low" };
  }, [result]);

  const topFactors = useMemo(() => {
    if (!result) return [];
    return [...result.contributions]
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 8);
  }, [result]);

  const maxAbs = topFactors.length ? Math.max(...topFactors.map((f) => Math.abs(f.contribution))) : 1;

  return (
    <section className="tab-panel">
      <div className="pred-layout">
        <div className="form-card">
          <h3>Employee Profile</h3>
          <p className="desc">
            Enter an employee&apos;s attributes to estimate their attrition probability using the trained logistic regression model.
          </p>
          <div className="form-grid">
            <div className="field">
              <label>Department</label>
              <select value={form.Department} onChange={(e) => set("Department", e.target.value)}>
                {catOptions.Department.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>City</label>
              <select value={form.City} onChange={(e) => set("City", e.target.value)}>
                {catOptions.City.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Gender</label>
              <select value={form.Gender} onChange={(e) => set("Gender", e.target.value)}>
                {catOptions.Gender.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Marital Status</label>
              <select value={form.Marital_Status} onChange={(e) => set("Marital_Status", e.target.value)}>
                {catOptions.Marital_Status.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Education Level</label>
              <select value={form.EducationLevel} onChange={(e) => set("EducationLevel", e.target.value)}>
                {catOptions.EducationLevel.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Work Mode</label>
              <select value={form.Work_Mode} onChange={(e) => set("Work_Mode", e.target.value)}>
                {catOptions.Work_Mode.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Age: {form.Age}</label>
              <div className="range-row">
                <input type="range" min={18} max={70} value={form.Age} onChange={(e) => set("Age", +e.target.value)} />
                <span className="range-val">{form.Age}</span>
              </div>
            </div>
            <div className="field">
              <label>Years at Company: {form.YearsAtCompany}</label>
              <div className="range-row">
                <input type="range" min={0} max={20} value={form.YearsAtCompany} onChange={(e) => set("YearsAtCompany", +e.target.value)} />
                <span className="range-val">{form.YearsAtCompany}</span>
              </div>
            </div>
            <div className="field">
              <label>Satisfaction Score (1–5)</label>
              <div className="range-row">
                <input type="range" min={1} max={5} value={form.SatisfactionScore} onChange={(e) => set("SatisfactionScore", +e.target.value)} />
                <span className="range-val">{form.SatisfactionScore}</span>
              </div>
            </div>
            <div className="field">
              <label>Performance Rating (1–5)</label>
              <div className="range-row">
                <input type="range" min={1} max={5} value={form.PerformanceRating} onChange={(e) => set("PerformanceRating", +e.target.value)} />
                <span className="range-val">{form.PerformanceRating}</span>
              </div>
            </div>
            <div className="field">
              <label>Training Hours (last year)</label>
              <div className="range-row">
                <input type="range" min={0} max={100} value={form.TrainingHoursLastYear} onChange={(e) => set("TrainingHoursLastYear", +e.target.value)} />
                <span className="range-val">{form.TrainingHoursLastYear}</span>
              </div>
            </div>
            <div className="field">
              <label>Works Overtime</label>
              <select value={String(form.OverTime)} onChange={(e) => set("OverTime", e.target.value === "true")}>
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>
          <button className="predict-btn" onClick={run}>
            Predict Attrition Risk
          </button>
        </div>

        <div className="result-card">
          {!result || !verdict ? (
            <div className="result-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 2v10l7 7" />
              </svg>
              <div>Fill the form and run a prediction to see the attrition risk and the factors driving it.</div>
            </div>
          ) : (
            <>
              <div className="gauge-wrap">
                <div className="gauge-label">Predicted Attrition Risk</div>
                <div className={`gauge-verdict ${verdict.cls}`}>{verdict.label}</div>
                <div className="gauge-prob">Probability of leaving: {(result.prob * 100).toFixed(1)}%</div>
                <div className="gauge-track">
                  <div className="gauge-needle" style={{ left: `${Math.min(100, Math.max(0, result.prob * 100))}%` }} />
                </div>
                <div className="gauge-scale">
                  <span>0% · Low</span>
                  <span>50%</span>
                  <span>100% · High</span>
                </div>
              </div>

              <div className="factors-title">Top factors influencing this prediction</div>
              {topFactors.map((f) => {
                const w = (Math.abs(f.contribution) / maxAbs) * 48;
                const pos = f.contribution > 0;
                return (
                  <div className="factor-row" key={f.feature}>
                    <div className="factor-name">{humanFeatureName(f.feature)}</div>
                    <div className="factor-bar-track">
                      <div className="factor-mid" />
                      <div
                        className={`factor-bar-fill ${pos ? "pos" : "neg"}`}
                        style={pos ? { width: `${w}%`, left: "50%" } : { width: `${w}%`, right: "50%" }}
                      />
                    </div>
                    <div className="factor-val">{(pos ? "+" : "") + f.contribution.toFixed(2)}</div>
                  </div>
                );
              })}
              <div className="callout" style={{ marginTop: 18 }}>
                Bars to the <b>right</b> (amber) increase attrition risk; bars to the <b>left</b> (teal) reduce it. Values are standardized
                logistic-regression contributions to the log-odds.
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
