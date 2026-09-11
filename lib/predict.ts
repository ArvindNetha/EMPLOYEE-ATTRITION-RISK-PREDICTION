import { MODEL } from "./data";

export interface PredictInput {
  Age: number;
  YearsAtCompany: number;
  TrainingHoursLastYear: number;
  SatisfactionScore: number;
  PerformanceRating: number;
  OverTime: boolean;
  Department: string;
  Work_Mode: string;
  Marital_Status: string;
  EducationLevel: string;
  Gender: string;
  City: string;
}

export interface Contribution {
  feature: string;
  contribution: number;
}

export interface PredictResult {
  prob: number;
  contributions: Contribution[];
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function computeFeatureVector(input: PredictInput): number[] {
  const vec: Record<string, number> = {};
  MODEL.num_cols.forEach((c) => (vec[c] = input[c as keyof PredictInput] as number));
  vec["OverTime"] = input.OverTime ? 1 : 0;
  MODEL.cat_cols.forEach((c) => {
    MODEL.cat_values[c].forEach((val) => {
      vec[c + "_" + val] = input[c as keyof PredictInput] === val ? 1 : 0;
    });
  });
  return MODEL.feature_names.map((fn) => (vec[fn] === undefined ? 0 : vec[fn]));
}

export function predict(input: PredictInput): PredictResult {
  const raw = computeFeatureVector(input);
  const standardized = raw.map((v, i) => (v - MODEL.scaler_mean[i]) / MODEL.scaler_scale[i]);
  let z = MODEL.intercept;
  const contributions: Contribution[] = [];
  standardized.forEach((v, i) => {
    const c = v * MODEL.coef[i];
    z += c;
    contributions.push({ feature: MODEL.feature_names[i], contribution: c });
  });
  return { prob: sigmoid(z), contributions };
}
