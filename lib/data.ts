import employeesJson from "@/data/employees.json";
import modelJson from "@/data/model.json";

export type EmployeeValue = string | number | boolean | null;

export interface EmployeeData {
  headers: string[];
  rows: EmployeeValue[][];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc: number;
  confusion_matrix: number[][];
  train_size: number;
  test_size: number;
}

export interface ModelType {
  feature_names: string[];
  coef: number[];
  intercept: number;
  scaler_mean: number[];
  scaler_scale: number[];
  metrics: ModelMetrics;
  num_cols: string[];
  bool_cols: string[];
  cat_cols: string[];
  cat_values: Record<string, string[]>;
  num_medians: Record<string, number>;
  roc_points: number[][];
}

export type EmployeeRow = Record<string, EmployeeValue>;

const EMPLOYEE_DATA = employeesJson as EmployeeData;
export const MODEL = modelJson as ModelType;

export const HEADERS = EMPLOYEE_DATA.headers;

export const ALL_ROWS: EmployeeRow[] = EMPLOYEE_DATA.rows.map((r) => {
  const o: EmployeeRow = {};
  HEADERS.forEach((h, i) => (o[h] = r[i]));
  return o;
});

export const TOTAL_N = ALL_ROWS.length;

export function uniqueSorted(field: string): (string | number)[] {
  const s = new Set<string | number>();
  ALL_ROWS.forEach((r) => {
    const v = r[field];
    if (v !== null && v !== undefined && v !== "") s.add(v as string | number);
  });
  return Array.from(s).sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b;
    return String(a).localeCompare(String(b));
  });
}

export function fmtNum(n: number | null | undefined, d = 0): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toLocaleString("en-IN", { maximumFractionDigits: d });
}

export function pct(n: number | null | undefined, d = 1): string {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return n.toFixed(d) + "%";
}

export const isAttrited = (r: EmployeeRow) => r.Attrition === true;
export const isRetained = (r: EmployeeRow) => r.Attrition === false;

export interface Filters {
  department: string;
  city: string;
  gender: string;
  workmode: string;
  marital: string;
  education: string;
  empstatus: string;
  overtime: string;
}

export const EMPTY_FILTERS: Filters = {
  department: "",
  city: "",
  gender: "",
  workmode: "",
  marital: "",
  education: "",
  empstatus: "",
  overtime: "",
};

export function getFilteredRows(f: Filters): EmployeeRow[] {
  return ALL_ROWS.filter((r) => {
    if (f.department && r.Department !== f.department) return false;
    if (f.city && r.City !== f.city) return false;
    if (f.gender && r.Gender !== f.gender) return false;
    if (f.workmode && r.Work_Mode !== f.workmode) return false;
    if (f.marital && r.Marital_Status !== f.marital) return false;
    if (f.education && r.EducationLevel !== f.education) return false;
    if (f.empstatus && r.Employment_Status !== f.empstatus) return false;
    if (f.overtime !== "" && String(r.OverTime) !== f.overtime) return false;
    return true;
  });
}

export function humanFeatureName(f: string): string {
  const map: Record<string, string> = {
    Age: "Age",
    YearsAtCompany: "Tenure (years)",
    TrainingHoursLastYear: "Training hours",
    SatisfactionScore: "Satisfaction score",
    PerformanceRating: "Performance rating",
    OverTime: "Works overtime",
  };
  if (map[f]) return map[f];
  const cat = f.split("_")[0];
  const val = f.slice(cat.length + 1);
  return `${cat.replace("_", " ")}: ${val}`;
}
