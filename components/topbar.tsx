"use client";

import { fmtNum } from "@/lib/data";
import { MenuIcon } from "./icons";
import type { TabId } from "./app-shell";

const META: Record<TabId, { title: string; sub: string }> = {
  dashboard: { title: "Attrition Dashboard", sub: "Explore workforce retention signals across the organization" },
  predict: { title: "Risk Predictor", sub: "Estimate an individual employee's attrition probability" },
  model: { title: "Model Performance", sub: "How the underlying logistic-regression model behaves" },
  explorer: { title: "Data Explorer", sub: "Search, sort and inspect the employee dataset" },
  about: { title: "About", sub: "Project overview, methodology and responsible use" },
};

export default function Topbar({
  active,
  matched,
  onMenu,
}: {
  active: TabId;
  matched: number;
  onMenu: () => void;
}) {
  const meta = META[active];
  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button className="menu-btn" onClick={onMenu} aria-label="Toggle navigation">
          <MenuIcon />
        </button>
        <div>
          <h2>{meta.title}</h2>
          <div className="sub">{meta.sub}</div>
        </div>
      </div>
      <div className="topbar-right">
        {active === "dashboard" && (
          <span className="pill">
            <span className="dot" />
            {fmtNum(matched)} employees in view
          </span>
        )}
        <span className="pill">Model: v1 · Logistic</span>
      </div>
    </header>
  );
}
