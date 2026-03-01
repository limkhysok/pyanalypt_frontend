import apiClient from '@/lib/axios';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/project';

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
    }
};
