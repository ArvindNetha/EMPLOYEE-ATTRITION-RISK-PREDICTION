"use client";

import { AboutIcon, DashboardIcon, ExplorerIcon, ModelIcon, PredictionIcon } from "./icons";
import type { TabId } from "./app-shell";

const ITEMS: { id: TabId; label: string; Icon: (p: { className?: string }) => React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", Icon: DashboardIcon },
  { id: "predict", label: "Risk Predictor", Icon: PredictionIcon },
  { id: "model", label: "Model Performance", Icon: ModelIcon },
  { id: "explorer", label: "Data Explorer", Icon: ExplorerIcon },
  { id: "about", label: "About", Icon: AboutIcon },
];

export default function Sidebar({
  active,
  onSelect,
  open,
}: {
  active: TabId;
  onSelect: (t: TabId) => void;
  open: boolean;
}) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-mark">WA</div>
        <div className="brand-text">
          <h1>Workforce Attrition</h1>
          <p>HR Intelligence Suite</p>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-label">Analytics</div>
        {ITEMS.map((it) => (
          <button
            key={it.id}
            className={`nav-item ${active === it.id ? "active" : ""}`}
            onClick={() => onSelect(it.id)}
            aria-current={active === it.id ? "page" : undefined}
          >
            <it.Icon />
            {it.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <b>Attrition Risk Engine</b>
        <br />
        Logistic regression · explainable
      </div>
    </aside>
  );
}
