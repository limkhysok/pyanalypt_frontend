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
    datasets?: Dataset[];
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

export interface Dataset {
    id: number | string;
    project: string;
    file: string | null;
    name: string;
    file_format: string;
    row_count?: number;
    column_count?: number;
    uploaded_at: string;
}

export interface UploadDatasetRequest {
    project: string;
    file: File;
    name?: string;
}

export interface PasteDatasetRequest {
    project: string;
    raw_data: string;
    name?: string;
    format?: string;
}

export interface DatasetPreview {
    columns: string[];
    rows: Record<string, any>[];
    metadata: {
        dtypes: Record<string, string>;
        shape: [number, number];
    };
    summary?: Record<string, any>;
    total_rows_hint: number;
}
