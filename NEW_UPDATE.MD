We've added Step 3: Exploratory Data Analysis (EDA) to the backend.
All 7 new endpoints are live under /api/v1/eda/. They are all GET requests,
read-only, and require a Bearer JWT token.

Base URL: GET /api/v1/eda/

─────────────────────────────────────────────────────────────────────────────
1. CORRELATION MATRIX
─────────────────────────────────────────────────────────────────────────────
GET /eda/correlation/{dataset_id}/

Query params:
  columns   (repeatable, optional) — e.g. ?columns=age&columns=salary
            If omitted, all numeric columns are used automatically.
  method    (optional, default: "pearson") — "pearson" | "spearman" | "kendall"

Response shape:
{
  "columns": ["age", "salary", "score"],
  "method": "pearson",
  "matrix": [
    { "column": "age",    "values": { "age": 1.0, "salary": 0.74, "score": -0.23 } },
    { "column": "salary", "values": { "age": 0.74, "salary": 1.0, "score": 0.18 } },
    { "column": "score",  "values": { "age": -0.23, "salary": 0.18, "score": 1.0 } }
  ]
}

UI hint: render as a color-coded heatmap grid. Values range from -1 to 1.
Diagonal is always 1.0.

─────────────────────────────────────────────────────────────────────────────
2. DISTRIBUTION (histogram + stats)
─────────────────────────────────────────────────────────────────────────────
GET /eda/distribution/{dataset_id}/

Query params:
  columns   (repeatable, optional) — numeric columns only; defaults to all numeric
  bins      (optional, default: 20, max: 100) — number of histogram bins

Response shape (one key per column):
{
  "salary": {
    "count": 950,
    "mean": 55200.4,
    "std": 12300.1,
    "min": 20000.0,
    "max": 110000.0,
    "skewness": 0.87,
    "kurtosis": 1.23,
    "bins": [
      { "range_start": 20000.0, "range_end": 23000.0, "count": 12 },
      { "range_start": 23000.0, "range_end": 26000.0, "count": 35 }
    ]
  }
}

UI hint: render a bar chart per column using bins[].count as bar heights.
Display skewness and kurtosis as stat badges below the chart.

─────────────────────────────────────────────────────────────────────────────
3. VALUE COUNTS (frequency table)
─────────────────────────────────────────────────────────────────────────────
GET /eda/value-counts/{dataset_id}/

Query params:
  columns   (repeatable, optional) — any column type; defaults to all columns
  top_n     (optional, default: 20, max: 100) — how many top values to return

Response shape:
{
  "country": {
    "total_rows": 1000,
    "null_count": 5,
    "unique_count": 42,
    "top_values": [
      { "value": "Cambodia", "count": 340, "pct": 34.0 },
      { "value": "Thailand", "count": 280, "pct": 28.0 },
      { "value": null,       "count": 5,   "pct": 0.5 }
    ]
  }
}

UI hint: render as a horizontal bar chart or ranked table.
null values appear as a row with value=null — display as "(empty)" or "—".

─────────────────────────────────────────────────────────────────────────────
4. CROSS-TABULATION (two-way frequency)
─────────────────────────────────────────────────────────────────────────────
GET /eda/crosstab/{dataset_id}/

Query params:
  col_a       (required) — row axis column
  col_b       (required) — column axis column
  normalize   (optional, default: false) — pass "true" for row percentages

Response shape (counts):
{
  "gender": ["F", "M"],
  "department": ["Engineering", "Marketing", "Sales"],
  "normalize": false,
  "table": [
    { "gender": "F", "Engineering": 45, "Marketing": 78, "Sales": 32 },
    { "gender": "M", "Engineering": 90, "Marketing": 41, "Sales": 67 }
  ]
}

With normalize=true, values are proportions (each row sums to ~1.0).

Constraint: each column must have ≤ 50 unique values. Backend returns 400 if exceeded.

UI hint: render as a pivot table or grouped bar chart. Offer a toggle between
counts and percentages (just change the normalize query param).

─────────────────────────────────────────────────────────────────────────────
5. OUTLIER SUMMARY (read-only scan)
─────────────────────────────────────────────────────────────────────────────
GET /eda/outlier-summary/{dataset_id}/

Query params:
  method      (optional, default: "iqr") — "iqr" | "zscore"
  threshold   (optional, default: 1.5)   — IQR multiplier or Z-score cutoff

Response shape:
{
  "method": "iqr",
  "threshold": 1.5,
  "total_rows": 1000,
  "numeric_columns_checked": 5,
  "columns_with_outliers": 2,
  "total_outlier_cells": 34,
  "per_column": {
    "salary": {
      "outlier_count": 22,
      "outlier_pct": 2.2,
      "lower_bound": 18000.0,
      "upper_bound": 95000.0,
      "mean": 55200.4,
      "std": 12300.1
    },
    "age": {
      "outlier_count": 0,
      "outlier_pct": 0.0,
      "lower_bound": 18.0,
      "upper_bound": 72.0,
      "mean": 35.4,
      "std": 11.2
    }
  }
}

UI hint: this is a summary scan only — no data is changed. To act on outliers,
redirect the user to the Datalab outlier treatment tools (trim / impute / cap).

─────────────────────────────────────────────────────────────────────────────
6. MISSING VALUE HEATMAP
─────────────────────────────────────────────────────────────────────────────
GET /eda/missing-heatmap/{dataset_id}/

No query params.

Response shape:
{
  "total_rows": 1000,
  "total_columns": 8,
  "columns_with_nulls": 3,
  "per_column": {
    "salary":  { "null_count": 12, "null_pct": 1.2 },
    "age":     { "null_count": 0,  "null_pct": 0.0 },
    "address": { "null_count": 45, "null_pct": 4.5 }
  },
  "worst_rows": [
    { "row_index": 142, "null_count": 3 },
    { "row_index": 567, "null_count": 2 }
  ],
  "co_null_pairs": {
    "salary × address": 0.712
  }
}

UI hint:
- per_column: render as a bar chart sorted by null_pct descending.
- worst_rows: show a small table of the rows most affected by nulls.
- co_null_pairs: only shows pairs with |correlation| ≥ 0.5.
  Render as a callout — "When 'salary' is null, 'address' tends to be too."

─────────────────────────────────────────────────────────────────────────────
7. PAIRWISE SCATTER
─────────────────────────────────────────────────────────────────────────────
GET /eda/pairwise/{dataset_id}/

Query params:
  col_x     (required) — X-axis column
  col_y     (required) — Y-axis column
  sample    (optional, default: 500, max: 5000) — max points returned

Response shape:
{
  "col_x": "age",
  "col_y": "salary",
  "total_valid_rows": 988,
  "sampled": 500,
  "pearson_r": 0.7412,
  "points": [
    { "x": 28, "y": 45000 },
    { "x": 35, "y": 62000 }
  ]
}

UI hint: render as a scatter plot (x/y points). Show pearson_r as a stat badge.
If sampled < total_valid_rows, display a note: "Showing 500 of 988 valid rows."
pearson_r is computed on the full dataset (not the sample), so it's always accurate.

─────────────────────────────────────────────────────────────────────────────
GENERAL RULES FOR ALL EDA ENDPOINTS
─────────────────────────────────────────────────────────────────────────────
- All are GET requests — no request body.
- All require: Authorization: Bearer <access_token>
- None of them modify any data. Safe to call on every page load or tab switch.
- dataset_id is the integer ID from the Dataset object (same as datalab).
- Stored column casts (from /datalab/cast/) are applied before analysis,
  so results reflect the user's intended types.
- Standard error shape for all failures:
  { "error": "Human-readable message." }
- Common 400 causes: invalid method/threshold, non-numeric column passed to
  correlation or distribution, col_a/col_b missing for crosstab or pairwise,
  column not found in dataset.
