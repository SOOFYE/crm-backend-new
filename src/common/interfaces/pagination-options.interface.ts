export interface PaginationOptions<T> {
  page: number;
  limit: number;
  searchKey?: string;
  searchField?: (keyof T)[];
  filters?: Partial<T>;
  orderBy?: keyof T;
  orderDirection?: 'ASC' | 'DESC';
}