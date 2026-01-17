// Common API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  // Dynamic fields
  [key: string]: any;
}

// Strict Response Types
export interface LoginResponse extends ApiResponse {
  user: User;
}

export interface MeResponse extends ApiResponse {
  authenticated: boolean;
  user?: User;
}

export interface EstimatesResponse extends ApiResponse {
  estimates: Estimate[];
}

export interface EstimateDetailResponse extends ApiResponse {
  estimate: Estimate;
}

export interface CompanyMembersResponse extends ApiResponse {
  members: User[];
}

export interface StagesResponse extends ApiResponse {
  stages: ConstructionStage[];
}
