import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PaginationOptions } from 'src/common/interfaces/pagination-options.interface';
import { PaginationResult } from 'src/common/interfaces/pagination-result.interface';

@Injectable()
export class PaginationUtil {
  async paginate<T>(
    repository: Repository<T>,
    options: PaginationOptions<T>,
  ): Promise<PaginationResult<T>> {
    const { page, limit, searchKey, searchField, filters, orderBy, orderDirection } = options;
    const query: SelectQueryBuilder<T> = repository.createQueryBuilder();

    if (searchKey && searchField) {
      // Handle multiple search fields
      const searchConditions = searchField.map(field => `${String(field)} LIKE :searchKey`).join(' OR ');
      query.where(searchConditions, { searchKey: `%${searchKey}%` });
    }

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query.andWhere(`${key} = :${key}`, { [key]: value });
      }
    }

    if (orderBy) {
      query.orderBy(orderBy as string, orderDirection || 'ASC');
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const hasNext = page * limit < total;

    return {
      data,
      total,
      page,
      limit,
      hasNext,
    };
  }
}
