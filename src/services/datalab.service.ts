import apiClient from '@/lib/axios';

export interface DataLabPreview {
  dataset_id: number;
  file_name: string;
  file_format: string;
  dataset_size: string;
  total_rows: number;
  total_columns: number;
  limit: number;
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface DataLabInspectColumn {
  column: string;
  dtype: string;
  non_null_count: number;
  null_count: number;
  null_pct: number;
  unique_count: number;
  is_unique: boolean;
}

export interface DataLabInspect {
  info: {
    columns: DataLabInspectColumn[];
    memory_usage_bytes: number;
  };
}

export interface CastColumnResult {
  column: string;
  from_dtype: string;
  to_dtype: string;
  status: string;
  validation?: { status: string; message: string };
}

export interface CastWarning {
  column: string;
  warning: string;
}

export interface CastResponse {
  updated_columns: CastColumnResult[];
}

export interface CastWarningResponse {
  detail: string;
  warnings: CastWarning[];
  errors: string[];
}

export type DropDuplicatesMode = "all_first" | "all_last" | "subset_keep" | "drop_all";

export interface DropDuplicatesRequest {
  mode: DropDuplicatesMode;
  subset?: string[];
  keep?: "first" | "last";
}

export interface DropDuplicatesResponse {
  rows_before: number;
  rows_after: number;
  rows_dropped: number;
  detail?: string;
}

export interface RenameColumnRequest {
  old_name: string;
  new_name: string;
}

export interface RenameColumnResponse {
  old_name: string;
  new_name: string;
  columns: string[];
}

export interface UpdateCellRequest {
  row_index: number;
  column: string;
  value: unknown;
}

export interface UpdateCellResponse {
  row_index: number;
  column: string;
  value: unknown;
}

export interface ReplaceValuesRequest {
  replacements: Record<string, string | number | null>;
  columns?: string[];
}

export interface ReplaceValuesResponse {
  replacements: Record<string, string | number | null>;
  columns_affected: string[];
  cells_replaced: number;
  detail?: string;
}

export interface DropNullsRowsRequest {
  axis: "rows";
  how?: "any" | "all";
  subset?: string[];
}

export interface DropNullsColumnsRequest {
  axis: "columns";
  thresh_pct: number;
}

export type DropNullsRequest = DropNullsRowsRequest | DropNullsColumnsRequest;

export interface DropNullsRowsResponse {
  axis: "rows";
  rows_before: number;
  rows_after: number;
  rows_dropped: number;
  detail?: string;
}

export interface DropNullsColumnsResponse {
  axis: "columns";
  columns_before: number;
  columns_after: number;
  columns_dropped: string[];
  detail?: string;
}

export type DropNullsResponse = DropNullsRowsResponse | DropNullsColumnsResponse;

export type FillNullsStrategy = "constant" | "mean" | "median" | "mode" | "ffill" | "bfill";

export interface FillNullsRequest {
  strategy: FillNullsStrategy;
  value?: string | number;
  columns?: string[];
}

export interface FillNullsResponse {
  strategy: string;
  cells_filled: number;
  skipped_columns: string[];
  detail?: string;
}

export type ArithmeticFormula = "divide" | "multiply" | "add" | "subtract";

export interface FillDerivedRequest {
  target: string;
  formula: ArithmeticFormula;
  operand_a: string;
  operand_b: string;
}

export interface FillDerivedResponse {
  target: string;
  formula: ArithmeticFormula;
  operand_a: string;
  operand_b: string;
  cells_filled: number;
  detail?: string;
}

export interface ValidateFormulaRequest {
  result_column: string;
  formula: ArithmeticFormula;
  operand_a: string;
  operand_b: string;
  tolerance?: number;
}

export interface FormulaErrorSample {
  row_index: number;
  calculated: number;
  diff: number;
  [key: string]: unknown;
}

export interface ValidateFormulaResponse {
  result_column: string;
  formula: ArithmeticFormula;
  operand_a: string;
  operand_b: string;
  tolerance: number;
  total_rows: number;
  checked_rows: number;
  error_rows: number;
  error_pct: number;
  sample_errors: FormulaErrorSample[];
}

export interface FixFormulaRequest {
  target: string;
  formula: ArithmeticFormula;
  operand_a: string;
  operand_b: string;
  tolerance?: number;
}

export interface FixFormulaResponse {
  target: string;
  formula: ArithmeticFormula;
  operand_a: string;
  operand_b: string;
  tolerance: number;
  cells_fixed: number;
  detail?: string;
}

export interface DataLabDescribeNumericStats {
  count?: number;
  mean?: number;
  std?: number;
  min?: number;
  "25%"?: number;
  "50%"?: number;
  "75%"?: number;
  max?: number;
}

export interface DataLabDescribeCategoricalStats {
  count?: number;
  unique?: number;
  top?: string | number;
  freq?: number;
}

export type DataLabDescribeColumnStats = DataLabDescribeNumericStats | DataLabDescribeCategoricalStats;

export interface DataLabDescribe {
  columns: Record<string, DataLabDescribeColumnStats>;
}

export interface OutlierColumnStats {
  outlier_count: number;
  outlier_pct: number;
  lower_bound: number;
  upper_bound: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  sample_outliers: Array<Record<string, unknown>>;
}

export interface DetectOutliersResponse {
  dataset_id: number;
  method: "iqr" | "zscore";
  threshold: number;
  columns: Record<string, OutlierColumnStats>;
}

export interface TrimOutliersRequest {
  columns: string[];
  method: "iqr" | "zscore";
  threshold: number;
}

export interface TrimOutliersResponse {
  columns: string[];
  method: string;
  threshold: number;
  rows_before: number;
  rows_after: number;
  rows_dropped: number;
  detail?: string;
}

export type ImputeOutliersStrategy = "median" | "mean" | "mode";

export interface ImputeOutliersRequest {
  columns: string[];
  method: "iqr" | "zscore";
  threshold: number;
  strategy: ImputeOutliersStrategy;
}

export interface ImputeOutliersResponse {
  columns: string[];
  method: string;
  threshold: number;
  strategy: string;
  cells_imputed: number;
  detail?: string;
}

export interface CapOutliersRequest {
  columns: string[];
  lower_pct: number;
  upper_pct: number;
}

export interface CapOutliersResponse {
  columns: string[];
  lower_pct: number;
  upper_pct: number;
  cells_capped: number;
  detail?: string;
}

export type TransformFunction = "log" | "sqrt" | "cbrt";

export interface TransformColumnRequest {
  columns: string[];
  function: TransformFunction;
}

export interface TransformColumnSkipped {
  column: string;
  reason: string;
}

export interface TransformColumnResponse {
  function: string;
  transformed_columns: string[];
  skipped_columns: TransformColumnSkipped[];
  detail?: string;
}

export const datalabApi = {
  async preview(datasetId: number, limit = 100): Promise<DataLabPreview> {
    const res = await apiClient.get<DataLabPreview>(`datalab/preview/${datasetId}/`, {
      params: limit === 100 ? undefined : { limit },
    });
    return res.data;
  },

  async inspect(datasetId: number): Promise<DataLabInspect> {
    const res = await apiClient.get<DataLabInspect>(`datalab/inspect/${datasetId}/`);
    return res.data;
  },

  async cast(datasetId: number, casts: Record<string, string>, force = false): Promise<CastResponse> {
    const body: Record<string, unknown> = { casts };
    if (force) body.force = true;
    const res = await apiClient.post<CastResponse>(`datalab/cast/${datasetId}/`, body);
    return res.data;
  },

  async dropDuplicates(datasetId: number, body: DropDuplicatesRequest): Promise<DropDuplicatesResponse> {
    const res = await apiClient.post<DropDuplicatesResponse>(`datalab/drop-duplicates/${datasetId}/`, body);
    return res.data;
  },

  async renameColumn(datasetId: number, body: RenameColumnRequest): Promise<RenameColumnResponse> {
    const res = await apiClient.post<RenameColumnResponse>(`datalab/rename-column/${datasetId}/`, body);
    return res.data;
  },

  async updateCell(datasetId: number, body: UpdateCellRequest): Promise<UpdateCellResponse> {
    const res = await apiClient.patch<UpdateCellResponse>(`datalab/update-cell/${datasetId}/`, body);
    return res.data;
  },

  async replaceValues(datasetId: number, body: ReplaceValuesRequest): Promise<ReplaceValuesResponse> {
    const res = await apiClient.post<ReplaceValuesResponse>(`datalab/replace-values/${datasetId}/`, body);
    return res.data;
  },

  async dropNulls(datasetId: number, body: DropNullsRequest): Promise<DropNullsResponse> {
    const res = await apiClient.post<DropNullsResponse>(`datalab/drop-nulls/${datasetId}/`, body);
    return res.data;
  },

  async fillNulls(datasetId: number, body: FillNullsRequest): Promise<FillNullsResponse> {
    const res = await apiClient.post<FillNullsResponse>(`datalab/fill-nulls/${datasetId}/`, body);
    return res.data;
  },

  async describe(datasetId: number): Promise<DataLabDescribe> {
    const res = await apiClient.get<DataLabDescribe>(`datalab/describe/${datasetId}/`);
    return res.data;
  },

  async fillDerived(datasetId: number, body: FillDerivedRequest): Promise<FillDerivedResponse> {
    const res = await apiClient.post<FillDerivedResponse>(`datalab/fill-derived/${datasetId}/`, body);
    return res.data;
  },

  async validateFormula(datasetId: number, body: ValidateFormulaRequest): Promise<ValidateFormulaResponse> {
    const res = await apiClient.post<ValidateFormulaResponse>(`datalab/validate-formula/${datasetId}/`, body);
    return res.data;
  },

  async fixFormula(datasetId: number, body: FixFormulaRequest): Promise<FixFormulaResponse> {
    const res = await apiClient.post<FixFormulaResponse>(`datalab/fix-formula/${datasetId}/`, body);
    return res.data;
  },

  async detectOutliers(datasetId: number, params: { columns: string; method?: string; threshold?: number }): Promise<DetectOutliersResponse> {
    const res = await apiClient.get<DetectOutliersResponse>(`datalab/detect-outliers/${datasetId}/`, { params });
    return res.data;
  },

  async trimOutliers(datasetId: number, body: TrimOutliersRequest): Promise<TrimOutliersResponse> {
    const res = await apiClient.post<TrimOutliersResponse>(`datalab/trim-outliers/${datasetId}/`, body);
    return res.data;
  },

  async imputeOutliers(datasetId: number, body: ImputeOutliersRequest): Promise<ImputeOutliersResponse> {
    const res = await apiClient.post<ImputeOutliersResponse>(`datalab/impute-outliers/${datasetId}/`, body);
    return res.data;
  },

  async capOutliers(datasetId: number, body: CapOutliersRequest): Promise<CapOutliersResponse> {
    const res = await apiClient.post<CapOutliersResponse>(`datalab/cap-outliers/${datasetId}/`, body);
    return res.data;
  },

  async transformColumn(datasetId: number, body: TransformColumnRequest): Promise<TransformColumnResponse> {
    const res = await apiClient.post<TransformColumnResponse>(`datalab/transform-column/${datasetId}/`, body);
    return res.data;
  },
};
