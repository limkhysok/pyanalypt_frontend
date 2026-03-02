import apiClient from '@/lib/axios';
import {
    Project,
    CreateProjectRequest,
    UpdateProjectRequest,
    Dataset,
    UploadDatasetRequest,
    PasteDatasetRequest,
    DatasetPreview
} from '@/types/project';

/**
 * Project API Service
 * Handles all project-related API calls
 */
export const projectApi = {
    /**
     * Get a list of all projects owned by the currently authenticated user
     */
    async getAll(): Promise<Project[]> {
        console.log("[ProjectApi] Fetching all projects...");
        const response = await apiClient.get<Project[]>('/projects/');
        return response.data;
    },

    /**
     * Create a new project
     */
    async create(data: CreateProjectRequest): Promise<Project> {
        console.log("[ProjectApi] Creating project:", data.name);
        const response = await apiClient.post<Project>('/projects/', data);
        return response.data;
    },

    /**
     * Retrieve details of a specific project by UUID
     */
    async getById(id: string): Promise<Project> {
        console.log("[ProjectApi] Fetching project details:", id);
        const response = await apiClient.get<Project>(`/projects/${id}/`);
        return response.data;
    },

    /**
     * Update all fields of a project (Full Replace)
     */
    async update(id: string, data: Project): Promise<Project> {
        console.log("[ProjectApi] Updating project (Full):", id);
        const response = await apiClient.put<Project>(`/projects/${id}/`, data);
        return response.data;
    },

    /**
     * Update specific fields of a project (Partial)
     */
    async patch(id: string, data: UpdateProjectRequest): Promise<Project> {
        console.log("[ProjectApi] Updating project (Partial):", id);
        const response = await apiClient.patch<Project>(`/projects/${id}/`, data);
        return response.data;
    },

    /**
     * Permanently delete a project
     */
    async delete(id: string): Promise<void> {
        console.log("[ProjectApi] Deleting project:", id);
        await apiClient.delete(`/projects/${id}/`);
    },

    /**
     * Upload a dataset file
     */
    async uploadDataset(data: UploadDatasetRequest): Promise<Dataset> {
        console.log("[ProjectApi] Uploading dataset file for project:", data.project);
        const formData = new FormData();
        formData.append('project', data.project);
        formData.append('file', data.file);
        if (data.name) formData.append('name', data.name);

        const response = await apiClient.post<Dataset>('/datasets/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Paste a dataset as raw text
     */
    async pasteDataset(data: PasteDatasetRequest): Promise<Dataset> {
        console.log("[ProjectApi] Pasting dataset for project:", data.project);
        const response = await apiClient.post<Dataset>('/datasets/paste/', data);
        return response.data;
    },

    /**
     * Get a preview (columns and first 10 rows) of a dataset
     */
    async getDatasetPreview(datasetId: number | string, rows: number = 10): Promise<DatasetPreview> {
        console.log("[ProjectApi] Fetching dataset preview:", datasetId, "Rows:", rows);
        const response = await apiClient.get<DatasetPreview>(`/datasets/items/${datasetId}/preview/`, {
            params: { rows }
        });
        return response.data;
    },

    /**
     * Update dataset metadata (e.g., rename)
     */
    async updateDataset(datasetId: number | string, data: { name: string }): Promise<Dataset> {
        console.log("[ProjectApi] Updating dataset:", datasetId);
        const response = await apiClient.patch<Dataset>(`/datasets/items/${datasetId}/`, data);
        return response.data;
    },

    /**
     * Permanently delete a dataset
     */
    async deleteDataset(datasetId: number | string): Promise<void> {
        console.log("[ProjectApi] Deleting dataset:", datasetId);
        await apiClient.delete(`/datasets/items/${datasetId}/`);
    }
};
