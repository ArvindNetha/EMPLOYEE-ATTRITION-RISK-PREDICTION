"use client";

import { useMemo, useRef, useState } from "react";
import { ALL_ROWS, fmtNum, HEADERS, type EmployeeRow, type EmployeeValue } from "@/lib/data";
import { SearchIcon, UploadIcon } from "./icons";

const PAGE_SIZE = 25;

function cellDisplay(h: string, v: EmployeeValue) {
  if (v === null || v === undefined || v === "") return <span style={{ color: "var(--text-faint)" }}>—</span>;
  if (h === "Attrition") {
    return v === true ? <span className="badge badge-yes">Left</span> : <span className="badge badge-no">Stayed</span>;
  }
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

export default function ExplorerTab() {
  const [dataset, setDataset] = useState<{ headers: string[]; rows: EmployeeRow[] }>({ headers: HEADERS, rows: ALL_ROWS });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);
  const [uploadName, setUploadName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let out = dataset.rows;
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((r) => dataset.headers.some((h) => String(r[h] ?? "").toLowerCase().includes(q)));
    }
    if (sort) {
      out = [...out].sort((a, b) => {
        const av = a[sort.key];
        const bv = b[sort.key];
        if (av === null || av === undefined || av === "") return 1;
        if (bv === null || bv === undefined || bv === "") return -1;
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
        return String(av).localeCompare(String(bv)) * sort.dir;
      });
    }
    return out;
  }, [dataset, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((s) => (s && s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadName(file.name);
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, EmployeeValue>>(ws, { defval: null });
    if (json.length === 0) return;
    const headers = Object.keys(json[0]);
    setDataset({ headers, rows: json as EmployeeRow[] });
    setQuery("");
    setSort(null);
    setPage(0);
  };

  const resetToDefault = () => {
    setDataset({ headers: HEADERS, rows: ALL_ROWS });
    setUploadName(null);
    setQuery("");
    setSort(null);
    setPage(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <section className="tab-panel">
      <div className="explorer-toolbar">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search across all columns…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <label className="upload-label">
          <UploadIcon />
          {uploadName ? "Replace file" : "Upload dataset (.xlsx / .csv)"}
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} />
        </label>
        {uploadName && (
          <button className="btn btn-ghost" onClick={resetToDefault}>
            Restore sample data
          </button>
        )}
      </div>

      {uploadName && (
        <div className="callout" style={{ marginBottom: 16 }}>
          Viewing uploaded file <b>{uploadName}</b> — {fmtNum(dataset.rows.length)} rows, {dataset.headers.length} columns.
        </div>
      )}

      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {dataset.headers.map((h) => (
                  <th key={h} onClick={() => toggleSort(h)}>
                    {h}
                    <span className="arrow">{sort && sort.key === h ? (sort.dir === 1 ? "▲" : "▼") : "⇅"}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr key={i}>
                  {dataset.headers.map((h) => (
                    <td key={h}>{cellDisplay(h, r[h])}</td>
                  ))}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={dataset.headers.length} style={{ textAlign: "center", padding: 40, color: "var(--text-faint)" }}>
                    No rows match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>
            Showing {fmtNum(filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1)}–
            {fmtNum(Math.min(filtered.length, safePage * PAGE_SIZE + PAGE_SIZE))} of {fmtNum(filtered.length)} rows
          </span>
          <div className="pagination">
            <button disabled={safePage === 0} onClick={() => setPage(0)}>
              «
            </button>
            <button disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
              ‹
            </button>
            <span>
              Page {safePage + 1} / {pageCount}
            </span>
            <button disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)}>
              ›
            </button>
            <button disabled={safePage >= pageCount - 1} onClick={() => setPage(pageCount - 1)}>
              »
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
