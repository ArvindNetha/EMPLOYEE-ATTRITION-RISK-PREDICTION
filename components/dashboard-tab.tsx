"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  EMPTY_FILTERS,
  fmtNum,
  Filters,
  getFilteredRows,
  isAttrited,
  pct,
  TOTAL_N,
  uniqueSorted,
  type EmployeeRow,
} from "@/lib/data";
import { AXIS, axisTick, ChartCard, ChartTooltip, COLORS, GRID, PALETTE } from "./chart-common";

const FILTER_FIELDS: { id: keyof Filters; label: string; field: string }[] = [
  { id: "department", label: "Department", field: "Department" },
  { id: "city", label: "City", field: "City" },
  { id: "gender", label: "Gender", field: "Gender" },
  { id: "workmode", label: "Work Mode", field: "Work_Mode" },
  { id: "marital", label: "Marital Status", field: "Marital_Status" },
  { id: "education", label: "Education", field: "EducationLevel" },
  { id: "empstatus", label: "Employment Status", field: "Employment_Status" },
];

function groupCount(rows: EmployeeRow[], field: string) {
  const m: Record<string, number> = {};
  rows.forEach((r) => {
    const raw = r[field];
    const v = raw === null || raw === undefined || raw === "" ? "Unknown" : String(raw);
    m[v] = (m[v] || 0) + 1;
  });
  return m;
}

export default function DashboardTab({
  filters,
  setFilters,
  rows,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  rows: EmployeeRow[];
}) {
  const kpis = useMemo(() => {
    const n = rows.length;
    const known = rows.filter((r) => r.Attrition === true || r.Attrition === false);
    const attr = rows.filter(isAttrited).length;
    const rate = known.length ? (attr / known.length) * 100 : 0;
    const active = rows.filter((r) => r.Employment_Status === "Active").length;
    const ages = rows.map((r) => r.Age).filter((v): v is number => typeof v === "number");
    const avgAge = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;
    const tenures = rows.map((r) => r.YearsAtCompany).filter((v): v is number => typeof v === "number");
    const avgTenure = tenures.length ? tenures.reduce((a, b) => a + b, 0) / tenures.length : 0;
    const sats = rows.map((r) => r.SatisfactionScore).filter((v): v is number => typeof v === "number");
    const avgSat = sats.length ? sats.reduce((a, b) => a + b, 0) / sats.length : 0;
    return [
      { label: "Total Employees", value: fmtNum(n), meta: `${fmtNum(active)} active`, accent: "amber" },
      { label: "Attrition Count", value: fmtNum(attr), meta: `of ${fmtNum(known.length)} with known status`, accent: "coral" },
      { label: "Attrition Rate", value: pct(rate), meta: rate > 30 ? "Elevated" : "Within typical range", accent: "coral" },
      { label: "Average Age", value: avgAge ? avgAge.toFixed(1) + " yrs" : "—", meta: `n=${fmtNum(ages.length)}`, accent: "blue" },
      { label: "Average Tenure", value: avgTenure ? avgTenure.toFixed(1) + " yrs" : "—", meta: "YearsAtCompany", accent: "teal" },
      { label: "Avg Satisfaction", value: avgSat ? avgSat.toFixed(2) + " / 5" : "—", meta: `n=${fmtNum(sats.length)}`, accent: "violet" },
    ];
  }, [rows]);

  const depts = useMemo(() => uniqueSorted("Department").map(String), []);
  const cities = useMemo(() => uniqueSorted("City").map(String), []);

  const deptData = useMemo(
    () =>
      depts.map((d) => ({
        name: d,
        Retained: rows.filter((r) => r.Department === d && r.Attrition === false).length,
        Attrited: rows.filter((r) => r.Department === d && r.Attrition === true).length,
      })),
    [depts, rows],
  );

  const deptRate = useMemo(
    () =>
      depts.map((d) => {
        const sub = rows.filter((r) => r.Department === d && (r.Attrition === true || r.Attrition === false));
        const a = sub.filter(isAttrited).length;
        return { name: d, rate: sub.length ? +((a / sub.length) * 100).toFixed(1) : 0 };
      }),
    [depts, rows],
  );

  const genderData = useMemo(() => {
    const g = groupCount(rows.filter((r) => r.Gender), "Gender");
    return Object.entries(g).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const workModeData = useMemo(() => {
    const g = groupCount(rows, "Work_Mode");
    return Object.entries(g).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const overtimeData = useMemo(
    () =>
      ["true", "false"].map((v, i) => {
        const sub = rows.filter((r) => String(r.OverTime) === v && (r.Attrition === true || r.Attrition === false));
        const a = sub.filter(isAttrited).length;
        return { name: i === 0 ? "Overtime: Yes" : "Overtime: No", rate: sub.length ? +((a / sub.length) * 100).toFixed(1) : 0 };
      }),
    [rows],
  );

  const ageData = useMemo(() => {
    const bins: [number, number][] = [[16, 25], [26, 35], [36, 45], [46, 55], [56, 65], [66, 75]];
    return bins.map((b) => ({
      name: `${b[0]}–${b[1]}`,
      count: rows.filter((r) => typeof r.Age === "number" && r.Age >= b[0] && r.Age <= b[1]).length,
    }));
  }, [rows]);

  const satData = useMemo(
    () =>
      [1, 2, 3, 4, 5].map((s) => {
        const sub = rows.filter((r) => r.SatisfactionScore === s && (r.Attrition === true || r.Attrition === false));
        const a = sub.filter(isAttrited).length;
        return {
          name: "Score " + s,
          rate: sub.length ? +((a / sub.length) * 100).toFixed(1) : 0,
          count: rows.filter((r) => r.SatisfactionScore === s).length,
        };
      }),
    [rows],
  );

  const cityData = useMemo(
    () =>
      cities
        .map((c) => ({ name: c, count: rows.filter((r) => r.City === c).length }))
        .sort((a, b) => b.count - a.count),
    [cities, rows],
  );

  const tenureData = useMemo(() => {
    const bins: [number, number][] = [[0, 2], [2, 4], [4, 6], [6, 8], [8, 10], [10, 12], [12, 15]];
    return bins.map((b) => ({
      name: `${b[0]}–${b[1]}y`,
      count: rows.filter((r) => typeof r.YearsAtCompany === "number" && r.YearsAtCompany >= b[0] && r.YearsAtCompany < b[1]).length,
    }));
  }, [rows]);

  const legendStyle = { fontSize: 11.5, color: AXIS };

  return (
    <section className="tab-panel">
      <div className="kpi-grid">
        {kpis.map((c) => (
          <div key={c.label} className="kpi-card" style={{ ["--kpi-accent" as string]: `var(--${c.accent})` }}>
            <div className="kpi-label">{c.label}</div>
            <div className="kpi-value">{c.value}</div>
            <div className="kpi-meta">{c.meta}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {FILTER_FIELDS.map((f) => (
          <div className="filter-group" key={f.id}>
            <label htmlFor={`f-${f.id}`}>{f.label}</label>
            <select
              id={`f-${f.id}`}
              value={filters[f.id]}
              onChange={(e) => setFilters({ ...filters, [f.id]: e.target.value })}
            >
              <option value="">All</option>
              {uniqueSorted(f.field).map((v) => (
                <option key={String(v)} value={String(v)}>
                  {String(v)}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div className="filter-group">
          <label htmlFor="f-overtime">Overtime</label>
          <select id="f-overtime" value={filters.overtime} onChange={(e) => setFilters({ ...filters, overtime: e.target.value })}>
            <option value="">All</option>
            <option value="true">Overtime: Yes</option>
            <option value="false">Overtime: No</option>
          </select>
        </div>
        <div className="filter-actions">
          <span className="filter-count">
            <b>{fmtNum(rows.length)}</b> of {fmtNum(TOTAL_N)} employees match
          </span>
          <button className="btn" onClick={() => setFilters({ ...EMPTY_FILTERS })}>
            Reset filters
          </button>
        </div>
      </div>

      <div className="charts-grid">
        <ChartCard title="Headcount & Attrition by Department" sub="Active vs. departed employees per department" span={6}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} interval={0} angle={-25} textAnchor="end" height={60} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={9} />
              <Bar dataKey="Retained" stackId="a" fill={COLORS.teal} radius={[0, 0, 0, 0]} maxBarSize={22} />
              <Bar dataKey="Attrited" stackId="a" fill={COLORS.coral} radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Attrition Rate by Department" sub="Share of employees who left, per department" span={6}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={deptRate} margin={{ top: 4, right: 16, left: 40, bottom: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} tickFormatter={(v) => v + "%"} />
              <YAxis type="category" dataKey="name" tick={axisTick} tickLine={false} axisLine={false} width={90} />
              <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="rate" name="Attrition rate" radius={[0, 4, 4, 0]} maxBarSize={26}>
                {deptRate.map((d, i) => (
                  <Cell key={i} fill={d.rate >= 40 ? COLORS.coral : d.rate >= 25 ? COLORS.amber : COLORS.teal} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Distribution" sub="Of records with gender recorded" span={4}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={genderData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="#121A2E" strokeWidth={2}>
                {genderData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={9} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Work Mode Split" sub="Onsite / Hybrid / Remote" span={4}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={workModeData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2} stroke="#121A2E" strokeWidth={2}>
                {workModeData.map((_, i) => (
                  <Cell key={i} fill={[COLORS.amber, COLORS.teal, COLORS.violet, COLORS.dim][i % 4]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={9} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Overtime vs Attrition" sub="Attrition rate for overtime vs no overtime" span={4}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overtimeData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(v) => v + "%"} />
              <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="rate" name="Attrition rate" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {overtimeData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? COLORS.coral : COLORS.teal} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Age Distribution" sub="Employee age bands" span={5}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Employees" fill={COLORS.blue} radius={[4, 4, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Satisfaction Score vs Attrition" sub="Attrition rate at each satisfaction level (1–5)" span={7}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={satData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis yAxisId="left" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(v) => v + "%"} />
              <YAxis yAxisId="right" orientation="right" tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={9} />
              <Bar yAxisId="left" dataKey="rate" name="Attrition rate %" fill={COLORS.coral} radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line yAxisId="right" dataKey="count" name="Employee count" stroke={COLORS.teal} strokeWidth={2} dot={{ r: 3, fill: COLORS.teal }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Headcount by City" sub="Employee count per office location" span={7}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={cityData} margin={{ top: 4, right: 16, left: 30, bottom: 0 }}>
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis type="number" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis type="category" dataKey="name" tick={axisTick} tickLine={false} axisLine={false} width={80} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Employees" fill={COLORS.amber} radius={[0, 4, 4, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Years at Company" sub="Tenure distribution" span={5}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tenureData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={axisTick} tickLine={false} axisLine={{ stroke: GRID }} />
              <YAxis tick={axisTick} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" name="Employees" fill={COLORS.violet} radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
