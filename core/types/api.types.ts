export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    status?: number;
    message?: string;
    code?: string;
    details?: Record<string, string>;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
