"use client";

import { fmtNum, HEADERS, MODEL, TOTAL_N } from "@/lib/data";

export default function AboutTab() {
  return (
    <section className="tab-panel">
      <div className="about-grid">
        <div>
          <div className="about-card">
            <h3>About this project</h3>
            <p>
              Workforce Attrition Intelligence is an interactive analytics workspace for HR teams. It turns a raw employee
              dataset into an explorable dashboard, a live attrition-risk predictor, and a transparent view of the underlying
              machine-learning model — so people leaders can spot retention risk early and act on it.
            </p>
            <p>
              The predictor is a <b>logistic regression</b> classifier trained on {fmtNum(MODEL.metrics.train_size)} employee
              records and evaluated on {fmtNum(MODEL.metrics.test_size)} held-out records. Numeric inputs are standardized with a{" "}
              <code>StandardScaler</code> and categorical inputs are one-hot encoded, producing {fmtNum(MODEL.feature_names.length)}{" "}
              model features in total.
            </p>

            <div className="callout">
              <b>How to read a prediction:</b> the model outputs a probability of attrition. Above ~60% is flagged High Risk,
              30–60% Medium, and below 30% Low. The factor bars show each feature&apos;s standardized contribution to the log-odds.
            </div>

            <h3 style={{ marginTop: 22 }}>What you can do</h3>
            <ul>
              <li><b>Dashboard</b> — filter {fmtNum(TOTAL_N)} employees and explore attrition across departments, cities, satisfaction, tenure, overtime and more.</li>
              <li><b>Risk Predictor</b> — enter an employee profile and get an instant, explainable attrition probability.</li>
              <li><b>Model Performance</b> — inspect accuracy, precision, recall, F1, ROC AUC, the confusion matrix and feature importance.</li>
              <li><b>Data Explorer</b> — search, sort and page through the full dataset, or upload your own <code>.xlsx</code> / <code>.csv</code> file.</li>
            </ul>

            <div className="callout coral">
              <b>Responsible use:</b> predictions are directional decision support, not a verdict on any individual. Use them to
              prioritize retention conversations — never as the sole basis for employment decisions.
            </div>
          </div>
        </div>

        <div className="about-side">
          <div className="about-card">
            <h3>Model at a glance</h3>
            <div className="info-list">
              <div className="info-row"><span>Algorithm</span><span>Logistic Regression</span></div>
              <div className="info-row"><span>Accuracy</span><span>{(MODEL.metrics.accuracy * 100).toFixed(1)}%</span></div>
              <div className="info-row"><span>ROC AUC</span><span>{MODEL.metrics.auc.toFixed(3)}</span></div>
              <div className="info-row"><span>F1 Score</span><span>{MODEL.metrics.f1.toFixed(3)}</span></div>
              <div className="info-row"><span>Features</span><span>{fmtNum(MODEL.feature_names.length)}</span></div>
              <div className="info-row"><span>Records</span><span>{fmtNum(TOTAL_N)}</span></div>
            </div>
          </div>

          <div className="about-card">
            <h3>Dataset columns</h3>
            <p style={{ marginBottom: 12 }}>{HEADERS.length} fields per employee record:</p>
            <div>
              {HEADERS.map((h) => (
                <span className="tag" key={h}>
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div className="about-card">
            <h3>Tech stack</h3>
            <div>
              {["Next.js", "React", "TypeScript", "Recharts", "Tailwind CSS", "Logistic Regression", "SheetJS"].map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
