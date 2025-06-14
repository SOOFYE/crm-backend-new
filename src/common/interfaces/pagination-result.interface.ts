export interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
  }