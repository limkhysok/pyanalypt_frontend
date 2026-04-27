/**
 * Centralized API exports
 * Import everything you need from '@/services/api'
 */

// API Client
export { default as apiClient } from '@/lib/axios';

// Services
export { authApi } from './auth.service';
export { projectApi } from './project.service';
export { datasetApi } from './dataset.service';
export { framingApi } from './framing.service';
export { datalabApi } from './datalab.service';
export type {
  DataLabPreview,
  DataLabInspect,
  DataLabInspectColumn,
  DataLabDescribe,
  DataLabDescribeNumericStats,
  DataLabDescribeCategoricalStats,
  DataLabDescribeColumnStats,
  CastColumnResult,
  CastResponse,
  CastWarning,
  DropDuplicatesMode,
  DropDuplicatesRequest,
  DropDuplicatesResponse,
  RenameColumnRequest,
  RenameColumnResponse,
  ReplaceValuesRequest,
  ReplaceValuesResponse,
  DropNullsRequest,
  DropNullsResponse,
  FillNullsRequest,
  FillNullsResponse,
  FillNullsStrategy,
  ArithmeticFormula,
  FillDerivedRequest,
  FillDerivedResponse,
  ValidateFormulaRequest,
  ValidateFormulaResponse,
  FixFormulaRequest,
  FixFormulaResponse,
  FormulaErrorSample,
} from './datalab.service';

// Utilities
export { tokenManager } from '@/lib/token';
export { parseApiError, getErrorMessage, formatFieldErrors } from '@/lib/error-handler';

// Types
export type {
    User,
    AuthResponse,
    RegisterRequest,
    LoginRequest,
    GoogleAuthRequest,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ApiError,
} from '@/types/api';

export type {
    Project,
    CreateProjectRequest,
    UpdateProjectRequest,
} from '@/types/project';

export type {
    Dataset,
    DatasetFrame,
    RenameDatasetRequest,
    UpdateCellResponse,
    DatasetExportFormat,
    WrangleDatasetRequest,
    VisualizeDatasetRequest,
} from '@/types/dataset';
