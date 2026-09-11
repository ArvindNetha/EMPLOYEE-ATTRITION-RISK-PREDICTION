"use client";

import { useMemo, useState } from "react";
import { EMPTY_FILTERS, getFilteredRows, type Filters } from "@/lib/data";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import DashboardTab from "./dashboard-tab";
import PredictionTab from "./prediction-tab";
import ModelTab from "./model-tab";
import ExplorerTab from "./explorer-tab";
import AboutTab from "./about-tab";

export type TabId = "dashboard" | "predict" | "model" | "explorer" | "about";

export default function AppShell() {
  const [active, setActive] = useState<TabId>("dashboard");
  const [filters, setFilters] = useState<Filters>({ ...EMPTY_FILTERS });
  const [navOpen, setNavOpen] = useState(false);

  const filteredRows = useMemo(() => getFilteredRows(filters), [filters]);

  const select = (t: TabId) => {
    setActive(t);
    setNavOpen(false);
  };

  return (
    <div className="app-shell">
      <Sidebar active={active} onSelect={select} open={navOpen} />
      <div className="main">
        <Topbar active={active} matched={filteredRows.length} onMenu={() => setNavOpen((o) => !o)} />
        <div className="content">
          {active === "dashboard" && <DashboardTab filters={filters} setFilters={setFilters} rows={filteredRows} />}
          {active === "predict" && <PredictionTab />}
          {active === "model" && <ModelTab />}
          {active === "explorer" && <ExplorerTab />}
          {active === "about" && <AboutTab />}
        </div>
      </div>
    </div>
  );
}
