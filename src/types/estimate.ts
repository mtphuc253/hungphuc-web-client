export interface Option {
  id: string;
  label: string;
}

export interface EstimatePackage {
  id: "thiet_ke" | "phan_tho" | "tron_goi";
  label: string;
  description: string;
  byFinish: boolean;
  availableTypes: string[];
  availableFinishes?: Record<string, string[]>;
}

export interface EstimatePublicConfig {
  enabled: boolean;
  aiEnabled: boolean;
  disclaimer: string;
  rangePercent: number;
  buildingTypes: Option[];
  finishLevels: Option[];
  roofTypes: Option[];
  foundationTypes: Option[];
  packages: EstimatePackage[];
}

export interface EstimateParams {
  buildingType: string;
  packageId: string;
  finishLevel: string;
  width: number | null;
  length: number | null;
  footprintArea?: number | null;
  floors: number;
  hasTum: boolean;
  hasBasement: boolean;
  roofType: string;
  foundation: string;
  yardArea: number | null;
  location: string;
  notes: string;
}

export interface EstimateLine {
  label: string;
  area: number;
  coefficient: number;
  convertedArea: number;
}

export interface EstimateResult {
  packageId: string;
  packageLabel: string;
  buildingTypeLabel: string;
  finishLevelLabel: string | null;
  basis: "floor_area" | "construction_area";
  lines: EstimateLine[];
  totalArea: number;
  unitPrice: number;
  total: number;
  low: number;
  high: number;
  rangePercent: number;
  assumptions: string[];
  disclaimer: string;
}

export interface EstimateAdvice {
  summary: string;
  tips: string[];
  questions: string[];
}

export interface EstimateResponse {
  id: string;
  params: EstimateParams;
  result: EstimateResult;
  advice: EstimateAdvice | null;
  adviceError?: string | null;
}

export interface ParseResponse {
  params: Partial<Record<keyof EstimateParams, unknown>>;
  assumptions: string[];
  missing: string[];
}

/* ------------------------------ Admin ------------------------------ */

export interface EstimateAdminPackage {
  id: string;
  label: string;
  description: string;
  basis: "floor_area" | "construction_area";
  byFinish: boolean;
  prices: Record<string, number | Record<string, number>>;
}

export interface EstimateAdminConfig {
  enabled: boolean;
  rangePercent: number;
  tumAreaRatio: number;
  disclaimer: string;
  packages: EstimateAdminPackage[];
  coefficients: {
    foundation: Record<string, number>;
    basement: number;
    floor: number;
    tum: number;
    roof: Record<string, number>;
    yard: number;
  };
}

export interface EstimateRecord {
  id: string;
  params: EstimateParams;
  result: EstimateResult;
  advice: EstimateAdvice | null;
  source_text: string | null;
  total: number;
  attribution: Record<string, string> | null;
  created_at: string;
  contact_id: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_status: string | null;
}

export interface EstimateStats {
  total: number;
  last_30_days: number;
  leads: number;
  leads_30_days: number;
  used_ai_parse: number;
  avg_total: number;
}
