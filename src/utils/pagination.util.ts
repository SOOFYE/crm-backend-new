import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PaginationOptions } from 'src/common/interfaces/pagination-options.interface';
import { PaginationResult } from 'src/common/interfaces/pagination-result.interface';


@Injectable()
export class PaginationUtil {
  async paginate<T>(
    repository: Repository<T>,
    options: PaginationOptions<T>,
    joinOptions?: {
      alias: string;
      relations?: { [key: string]: string | { alias: string; fields: string[] } };
      where?: (qb: SelectQueryBuilder<T>) => void; // Added support for a where function
    }
  ): Promise<PaginationResult<T>> {
    const { page, limit, searchKey, searchField, filters, orderBy, orderDirection } = options;
    const alias = joinOptions?.alias || 'entity';
    const query: SelectQueryBuilder<T> = repository.createQueryBuilder(alias);

    if (joinOptions?.relations) {
      for (const [relationAlias, relation] of Object.entries(joinOptions.relations)) {
        if (typeof relation === 'string') {
          query.leftJoinAndSelect(`${alias}.${relation}`, relationAlias);
        } else {
          query.leftJoin(`${alias}.${relationAlias}`, relation.alias);
          relation.fields.forEach(field => {
            query.addSelect(`${relation.alias}.${field}`, `${relation.alias}_${field}`);
          });
        }
      }
    }

    if (joinOptions?.where) {
      joinOptions.where(query);
    }

    if (searchKey && searchField) {
      const searchConditions = searchField.map(field => `${alias}.${String(field)} LIKE :searchKey`).join(' OR ');
      query.andWhere(searchConditions, { searchKey: `%${searchKey}%` });
    }

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== null && value !== undefined) {
          query.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
        }
      }
    }

    if (orderBy) {
      query.orderBy(`${alias}.${String(orderBy)}`, orderDirection || 'ASC');
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
