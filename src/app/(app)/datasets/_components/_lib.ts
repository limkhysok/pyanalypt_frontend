import { datasetApi } from "@/services/api";
import { Dataset, DatasetExportFormat } from "@/types/dataset";
import { tokenManager } from "@/lib/token";
import { toast } from "sonner";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2 GB

export const FORMAT_COLORS: Record<string, string> = {
    csv:     "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    json:    "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    xlsx:    "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    xls:     "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    parquet: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    sql:     "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400",
};

// ─────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function storageBarColor(pct: number): string {
    if (pct < 70) return "bg-emerald-500";
    if (pct < 90) return "bg-amber-500";
    return "bg-red-500";
}

export function getUsageLabel(pct: number): string {
    return pct > 0 && pct < 1 ? "<1%" : `${Math.round(pct)}%`;
}

export function getFilterLabel(filterType: string): string {
    return filterType === "all" ? "all formats" : filterType.toLowerCase();
}

export function getCountLabel(isFiltering: boolean, filteredCount: number, totalCount: number): string {
    const suffix = totalCount === 1 ? "" : "s";
    return isFiltering ? `${filteredCount} of ${totalCount}` : `${totalCount} dataset${suffix}`;
}

export function getSortLabel(sortBy: string): string {
    switch (sortBy) {
        case "newest":    return "newest first";
        case "oldest":    return "oldest first";
        case "name_asc":  return "name (a–z)";
        case "name_desc": return "name (z–a)";
        default:          return "sort";
    }
}

export function compareDatasets(a: Dataset, b: Dataset, sortBy: string): number {
    switch (sortBy) {
        case "newest":    return new Date(b.uploaded_date).getTime() - new Date(a.uploaded_date).getTime();
        case "oldest":    return new Date(a.uploaded_date).getTime() - new Date(b.uploaded_date).getTime();
        case "name_asc":  return a.file_name.localeCompare(b.file_name);
        case "name_desc": return b.file_name.localeCompare(a.file_name);
        default:          return 0;
    }
}

export function getImportAccept(format: DatasetExportFormat | null): string {
    if (format === "csv")     return ".csv";
    if (format === "xlsx")    return ".xlsx,.xls";
    if (format === "json")    return ".json";
    if (format === "parquet") return ".parquet,.pq";
    if (format === "sql")     return ".sql";
    return ".csv,.xlsx,.xls,.json,.parquet,.pq,.sql";
}

export function normalizeExportFormat(fileFormat: string): DatasetExportFormat | undefined {
    const normalized = fileFormat.trim().toLowerCase();
    if (normalized === "csv")                             return "csv";
    if (normalized === "json")                            return "json";
    if (normalized === "xlsx" || normalized === "xls")   return "xlsx";
    if (normalized === "parquet" || normalized === "pq") return "parquet";
    if (normalized === "sql")                             return "sql";
    return undefined;
}

// ─────────────────────────────────────────────
// Export / download helpers
// ─────────────────────────────────────────────

export function triggerDownload(blob: Blob, filename: string): void {
    const url    = globalThis.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href     = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    globalThis.URL.revokeObjectURL(url);
}

function isExportNotFoundError(error: unknown, status: number | undefined): boolean {
    return (
        status === 404 ||
        (error instanceof Error && error.message.includes("Export endpoint not found"))
    );
}

async function handleExportFallback(
    dataset: Dataset,
    explicitFormat: DatasetExportFormat | undefined,
    error: unknown,
): Promise<void> {
    const sourceFormat   = normalizeExportFormat(dataset.file_format);
    const status         = (error as { response?: { status?: number } })?.response?.status;
    const isNotFound     = isExportNotFoundError(error, status);
    const shouldFallback = !explicitFormat || explicitFormat === sourceFormat || isNotFound;

    if (!shouldFallback) {
        console.error("Export failed", error);
        toast.error(`Failed to export ${explicitFormat}.`);
        return;
    }

    try {
        const token    = tokenManager.getAccessToken();
        const response = await fetch(dataset.file, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) throw new Error(`Direct download failed: ${response.status}`);

        const blob         = await response.blob();
        const fallbackExt  = normalizeExportFormat(dataset.file_format) ?? "csv";
        const fallbackName = dataset.file_name || `dataset-${dataset.id}.${fallbackExt}`;
        triggerDownload(blob, fallbackName);

        const formatMismatch = explicitFormat && explicitFormat !== sourceFormat;
        if (formatMismatch) {
            toast.warning(`Converted export unavailable. Downloaded original ${dataset.file_format} file instead.`);
        } else {
            toast.success("Export ready.");
        }
    } catch (fallbackError) {
        console.error("Export failed", error);
        console.error("Direct file fallback failed", fallbackError);
        toast.error("Failed to export dataset.");
    }
}

export async function exportDataset(dataset: Dataset, explicitFormat?: DatasetExportFormat): Promise<void> {
    try {
        const format             = explicitFormat ?? normalizeExportFormat(dataset.file_format);
        const { blob, filename } = await datasetApi.exportDataset(dataset.id, format);
        const fallbackExt        = format ?? "csv";
        const fallbackName       = `${dataset.file_name.replace(/\.[^.]+$/, "")}.${fallbackExt}`;
        const downloadName       = filename ? decodeURIComponent(filename) : fallbackName;
        triggerDownload(blob, downloadName);
        toast.success("Export ready.");
    } catch (error) {
        await handleExportFallback(dataset, explicitFormat, error);
    }
}
