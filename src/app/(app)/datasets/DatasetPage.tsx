
"use client";

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
	Database,
	Search,
	Plus,
	Loader2,
	FileText,
	Download,
	Eye,
	Bug,
	Sparkles,
	ArrowUpDown,
	Calendar,
	Filter,
	Trash2,
	MoreVertical,
	Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { datasetApi } from "@/services/api";
import { Dataset, DatasetExportFormat } from "@/types/dataset";
import { tokenManager } from "@/lib/token";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}



function isExportNotFoundError(error: unknown, status: number | undefined): boolean {
	return status === 404 || (error instanceof Error && error.message.includes("Export endpoint not found"));
}

export default function DatasetPage() {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const router = useRouter();

	const [datasets, setDatasets] = useState<Dataset[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [uploadLoading, setUploadLoading] = useState(false);
	const [issueLoading, setIssueLoading] = useState<number | null>(null);
	const [sortBy, setSortBy] = useState<string>("newest");
	const [filterType, setFilterType] = useState<string>("all");
	const [isImportOpen, setIsImportOpen] = useState(false);
	const [selectedImportFormat, setSelectedImportFormat] = useState<DatasetExportFormat | null>(null);
	const [isRenameOpen, setIsRenameOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Dataset | null>(null);
	const [newName, setNewName] = useState("");
	const [exportingDatasetId, setExportingDatasetId] = useState<number | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const fetchDatasets = useCallback(async () => {
		setIsLoading(true);
		try {
			const data = await datasetApi.listDatasets();
			setDatasets(data);
		} catch (error) {
			console.error("Failed to fetch datasets", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (!authLoading && isAuthenticated) {
			fetchDatasets();
		}
	}, [authLoading, isAuthenticated, fetchDatasets]);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadLoading(true);
		try {
			await datasetApi.uploadDataset(file);
			toast.success("Dataset uploaded successfully");
			fetchDatasets();
		} catch (error) {
			console.error("Upload failed", error);
			toast.error("File upload failed");
		} finally {
			setUploadLoading(false);
			e.target.value = "";
			setSelectedImportFormat(null);
		}
	};

	const openFilePicker = (format?: DatasetExportFormat) => {
		if (uploadLoading) return;
		if (format) {
			setSelectedImportFormat(format);
		}
		fileInputRef.current?.click();
	};

	const openImportDialog = () => {
		if (uploadLoading) return;
		setIsImportOpen(true);
	};

	const handleImportFormatSelect = (format: DatasetExportFormat) => {
		setSelectedImportFormat(format);
		setIsImportOpen(false);

		globalThis.setTimeout(() => {
			openFilePicker(format);
		}, 30);
	};

	const importAccept = useMemo(() => {
		if (selectedImportFormat === "csv") return ".csv";
		if (selectedImportFormat === "xlsx") return ".xlsx,.xls";
		if (selectedImportFormat === "json") return ".json";
		if (selectedImportFormat === "parquet") return ".parquet,.pq";
		return ".csv,.xlsx,.xls,.json,.parquet,.pq";
	}, [selectedImportFormat]);

	const handleDiagnose = async (id: number) => {
		try {
			setIssueLoading(id);
			toast.info("Processing issue detection...");
			await datasetApi.diagnoseDataset(id);
			toast.success("Issue detection complete. Issues logged.");
			router.push(`/issues?dataset=${id}`);
		} catch (error) {
			if (error instanceof Error && error.message.includes("Diagnose endpoint not found")) {
				toast.warning("Issue scan endpoint is unavailable. Opening issues page.");
				router.push("/issues");
			} else {
				console.error("Issue detection error:", error);
				toast.error("Issue detection failed.");
			}
		} finally {
			setIssueLoading(null);
		}
	};

	const handleDelete = async (id: number) => {
		setDeleteLoading(true);
		try {
			await datasetApi.deleteDataset(id);
			toast.success("Dataset deleted.");
			setIsDeleteOpen(false);
			setDeleteTarget(null);
			fetchDatasets();
		} catch (error) {
			console.error("Delete failed", error);
			toast.error("Failed to delete dataset.");
		} finally {
			setDeleteLoading(false);
		}
	};

	const handleRename = async () => {
		if (!selectedDataset || !newName) return;
		try {
			await datasetApi.renameDataset(selectedDataset.id, { file_name: newName });
			toast.success("Artifact renamed.");
			setIsRenameOpen(false);
			setSelectedDataset(null);
			setNewName("");
			fetchDatasets();
		} catch (error) {
			console.error("Rename failed", error);
			toast.error("Failed to rename artifact.");
		}
	};

	const normalizeExportFormat = (fileFormat: string): DatasetExportFormat | undefined => {
		const normalized = fileFormat.trim().toLowerCase();
		if (normalized === "csv") return "csv";
		if (normalized === "json") return "json";
		if (normalized === "xlsx" || normalized === "xls") return "xlsx";
		if (normalized === "parquet" || normalized === "pq") return "parquet";
		return undefined;
	};

	const handleExport = async (dataset: Dataset, explicitFormat?: DatasetExportFormat) => {
		if (exportingDatasetId === dataset.id) return;

		setExportingDatasetId(dataset.id);
		try {
			const format = explicitFormat ?? normalizeExportFormat(dataset.file_format);
			const { blob, filename } = await datasetApi.exportDataset(dataset.id, format);
			const fallbackExt = format ?? "csv";
			const fallbackName = `${dataset.file_name.replace(/\.[^.]+$/, "")}.${fallbackExt}`;
			const downloadName = filename ? decodeURIComponent(filename) : fallbackName;

			const url = globalThis.URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = downloadName;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			globalThis.URL.revokeObjectURL(url);

			toast.success("Export ready.");
		} catch (error) {
			const sourceFormat = normalizeExportFormat(dataset.file_format);
			const status = (error as { response?: { status?: number } })?.response?.status;
			const isNotFoundError = isExportNotFoundError(error, status);
			const shouldTryDirectFallback = !explicitFormat || explicitFormat === sourceFormat || isNotFoundError;

			if (!shouldTryDirectFallback) {
				console.error("Export failed", error);
				toast.error(`Failed to export ${explicitFormat}.`);
				return;
			}

			try {
				const token = tokenManager.getAccessToken();
				const directResponse = await fetch(dataset.file, {
					headers: token ? { Authorization: `Bearer ${token}` } : undefined,
				});

				if (!directResponse.ok) {
					throw new Error(`Direct download failed: ${directResponse.status}`);
				}

				const blob = await directResponse.blob();
				const fallbackExt = normalizeExportFormat(dataset.file_format) ?? "csv";
				const fallbackName = dataset.file_name || `dataset-${dataset.id}.${fallbackExt}`;

				const url = globalThis.URL.createObjectURL(blob);
				const anchor = document.createElement("a");
				anchor.href = url;
				anchor.download = fallbackName;
				document.body.appendChild(anchor);
				anchor.click();
				anchor.remove();
				globalThis.URL.revokeObjectURL(url);

				if (explicitFormat && explicitFormat !== sourceFormat) {
					toast.warning(`Converted export unavailable. Downloaded original ${dataset.file_format} file instead.`);
				} else {
					toast.success("Export ready.");
				}
			} catch (fallbackError) {
				console.error("Export failed", error);
				console.error("Direct file fallback failed", fallbackError);
				toast.error("Failed to export dataset.");
			}
		} finally {
			setExportingDatasetId(null);
		}
	};


	const filteredDatasets = useMemo(() => {
		let result = datasets.filter((dataset) =>
			dataset.file_name.toLowerCase().includes(searchQuery.toLowerCase())
		);

		if (filterType !== "all") {
			result = result.filter((d) => d.file_format.toLowerCase() === filterType.toLowerCase());
		}

		result.sort((a, b) => {
			switch (sortBy) {
				case "newest": return new Date(b.uploaded_date).getTime() - new Date(a.uploaded_date).getTime();
				case "oldest": return new Date(a.uploaded_date).getTime() - new Date(b.uploaded_date).getTime();
				case "name_asc": return a.file_name.localeCompare(b.file_name);
				case "name_desc": return b.file_name.localeCompare(a.file_name);
				default: return 0;
			}
		});

		return result;
	}, [datasets, searchQuery, sortBy, filterType]);

	const getSortLabel = () => {
		switch (sortBy) {
			case "newest": return "Newest first";
			case "oldest": return "Oldest first";
			case "name_asc": return "Name (a-z)";
			case "name_desc": return "Name (z-a)";
			default: return "Sort";
		}
	};

	if (authLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
			</div>
		);
	}

	const renderListView = () => (
		<Card className="shadow-sm overflow-hidden border-border/60">
			<div className="overflow-x-auto">
				<table className="w-full text-sm text-left border-collapse">
					<thead className="bg-muted/50 border-b">
						<tr className="text-muted-foreground">
							<th className="px-4 py-3 w-12 text-center text-[10px] font-black tracking-widest opacity-50">Id</th>
							<th className="px-4 py-3 text-[10px] font-black tracking-widest opacity-50">File Name</th>
							<th className="px-4 py-3 text-[10px] font-black tracking-widest opacity-50">Format</th>
							<th className="px-4 py-3 text-right text-[10px] font-black tracking-widest opacity-50">Size</th>
							<th className="px-4 py-3 text-[10px] font-black tracking-widest opacity-50">Uploaded</th>
							<th className="px-4 py-3 text-right text-[10px] font-black tracking-widest opacity-50">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						<AnimatePresence mode="popLayout">
							{filteredDatasets.map((dataset, idx) => (
								<motion.tr
									key={dataset.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.1 }}
									className="hover:bg-muted/30"
								>
									<td className="px-4 py-3 text-center text-muted-foreground font-mono">
										{idx + 1}
									</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-2">
											<FileText className="h-4 w-4 text-muted-foreground" />
											<span className="font-medium text-foreground">{dataset.file_name}</span>
										</div>
									</td>
									<td className="px-4 py-3">
										<Badge variant="secondary" className="font-normal">
											{dataset.file_format.toLowerCase()}
										</Badge>
									</td>
									<td className="px-4 py-3 text-right tabular-nums">
										{formatFileSize(dataset.file_size)}
									</td>
									<td className="px-4 py-3 text-muted-foreground">
										<div className="flex items-center gap-1.5">
											<Calendar size={14} />
											{new Date(dataset.uploaded_date).toLocaleDateString()}
										</div>
									</td>
									<td className="px-4 py-3 text-right">
										<div className="flex items-center justify-end gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => router.push(`/datasets/${dataset.id}/preview`)}
											>
												<Eye className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => handleDiagnose(dataset.id)}
												disabled={issueLoading === dataset.id}
											>
												{issueLoading === dataset.id ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Bug className="h-4 w-4" />
												)}
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => router.push(`/datasets/${dataset.id}/clean`)}
											>
												<Sparkles className="h-4 w-4" />
											</Button>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="icon" className="h-8 w-8">
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => {
															setSelectedDataset(dataset);
															setNewName(dataset.file_name);
															setIsRenameOpen(true);
														}}
													>
														<Edit2 className="mr-2 h-4 w-4" /> Rename
													</DropdownMenuItem>
													<DropdownMenuSub>
														<DropdownMenuSubTrigger>
															<Download className="mr-2 h-4 w-4" /> Export
														</DropdownMenuSubTrigger>
														<DropdownMenuSubContent>
															<DropdownMenuItem onClick={() => handleExport(dataset, "csv")}>csv</DropdownMenuItem>
															<DropdownMenuItem onClick={() => handleExport(dataset, "xlsx")}>xlsx</DropdownMenuItem>
															<DropdownMenuItem onClick={() => handleExport(dataset, "json")}>json</DropdownMenuItem>
															<DropdownMenuItem onClick={() => handleExport(dataset, "parquet")}>parquet</DropdownMenuItem>
														</DropdownMenuSubContent>
													</DropdownMenuSub>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														onClick={() => {
															setDeleteTarget(dataset);
															setIsDeleteOpen(true);
														}}
													>
														<Trash2 className="mr-2 h-4 w-4" /> Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									</td>
								</motion.tr>
							))}
						</AnimatePresence>
					</tbody>
				</table>
			</div>
			{filteredDatasets.length === 0 && (
				<div className="py-20 text-center text-muted-foreground border-t">
					No datasets found.
				</div>
			)}
		</Card>
	);

	const renderContent = () => {
		if (isLoading) {
			return (
				<div className="border rounded-md p-4 space-y-4">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-10 bg-muted/40 animate-pulse rounded" />
					))}
				</div>
			)
		}

		if (datasets.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-md">
					<Database className="h-12 w-12 text-muted-foreground/30 mb-4" />
					<h3 className="text-lg font-semibold mb-1">No datasets available</h3>
					<p className="text-sm text-muted-foreground mb-6">Start by importing your first telemetry file.</p>
					<Button onClick={openImportDialog}>
						<Plus className="mr-2 h-4 w-4" /> Import Dataset
					</Button>
				</div>
			)
		}

		return renderListView();
	}

	return (
		<main className="min-h-screen pb-20 px-6 md:px-10 bg-background">
			<div className="max-w-7xl mx-auto space-y-8 pt-8">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none">Datasets</h1>
					<p className="text-sm text-muted-foreground font-medium">Manage and process your data artifacts.</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={openImportDialog}>
						<Plus className="mr-2 h-4 w-4" /> Import
					</Button>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
				<div className="flex items-center gap-2 w-full sm:w-auto">
					<div className="relative flex-1 sm:w-80">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search datasets..."
							className="pl-9"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<ArrowUpDown className="mr-2 h-4 w-4" /> {getSortLabel()}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
								<DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="name_asc">Name (a-z)</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="name_desc">Name (z-a)</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="sm">
								<Filter className="mr-2 h-4 w-4" /> {filterType === 'all' ? 'All formats' : filterType}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuRadioGroup value={filterType} onValueChange={setFilterType}>
								<DropdownMenuRadioItem value="all">All formats</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="CSV">csv</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="JSON">json</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="XLSX">xlsx</DropdownMenuRadioItem>
								<DropdownMenuRadioItem value="PARQUET">parquet</DropdownMenuRadioItem>
							</DropdownMenuRadioGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{renderContent()}

			<Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Import Dataset</DialogTitle>
						<DialogDescription>Select the source format for your data import.</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-4 py-4">
						{["csv", "xlsx", "json", "parquet"].map((fmt) => (
							<Button
								key={fmt}
								variant="outline"
								onClick={() => handleImportFormatSelect(fmt as DatasetExportFormat)}
							>
								{fmt.toUpperCase()}
							</Button>
						))}
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Rename Dataset</DialogTitle>
						<DialogDescription>Enter a new name for your telemetry file.</DialogDescription>
					</DialogHeader>
					<div className="py-4 space-y-2">
						<Label htmlFor="name">New Name</Label>
						<Input
							id="name"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
						<Button onClick={handleRename}>Save Changes</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Dataset</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete <span className="font-bold text-foreground">{deleteTarget?.file_name}</span>?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
						<Button variant="destructive" onClick={() => deleteTarget && handleDelete(deleteTarget.id)} disabled={deleteLoading}>
							{deleteLoading ? <Loader2 className="animate-spin" /> : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<input
				ref={fileInputRef}
				type="file"
				className="hidden"
				onChange={handleFileUpload}
				accept={importAccept}
				disabled={uploadLoading}
			/>
			</div>
		</main>
	);
}
