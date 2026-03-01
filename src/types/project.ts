export interface Project {
    id: string; // UUID
    name: string;
    slug: string;
    description: string;
    category: string;
    status: 'active' | 'archived' | 'completed';
    color_code: string;
    thumbnail: string | null;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
    last_accessed_at: string;
    settings: Record<string, any>;
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
    category?: string;
    color_code?: string;
    status?: string;
    is_favorite?: boolean;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> { }
