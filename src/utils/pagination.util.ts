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
      relations?: { [key: string]: string | { alias: string; fields: string[]; relations?: { [key: string]: { alias: string; fields: string[] } } } };
      where?: (qb: SelectQueryBuilder<T>) => void; 
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

          // Handle nested relations
          if (relation.relations) {
            for (const [nestedAlias, nestedRelation] of Object.entries(relation.relations)) {
              query.leftJoinAndSelect(`${relation.alias}.${nestedAlias}`, nestedRelation.alias);
              nestedRelation.fields.forEach(field => {
                query.addSelect(`${nestedRelation.alias}.${field}`, `${nestedRelation.alias}_${field}`);
              });
            }
          }
        }
      }
    }

    if (joinOptions?.where) {
      joinOptions.where(query);
    }

    if (searchKey && searchField) {
      const searchConditions = searchField.map(field => {
        if (String(field).includes('.')) {
          const [relationAlias, column] = String(field).split('.');
          return `${relationAlias}.${column} LIKE :searchKey`;
        } else {
          return `${alias}.${String(field)} LIKE :searchKey`;
        }
      }).join(' OR ');

      query.andWhere(searchConditions, { searchKey: `%${searchKey}%` });
    }

    if (filters !== undefined) {
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


  async paginateArray<T>(
    data: T[],
    options: PaginationOptions<T>,
  ): Promise<PaginationResult<T>> {
    const { page, limit, searchKey, searchField, filters, orderBy, orderDirection } = options;

    // Apply filtering based on searchKey
    if (searchKey && searchField) {
      data = data.filter(item =>
        searchField.some(field =>
          String(item[field]).toLowerCase().includes(searchKey.toLowerCase()),
        ),
      );
    }

    // Apply field-based filtering (optional)
    if (filters) {
      data = data.filter(item => {
        return Object.entries(filters).every(([key, value]) => item[key] === value);
      });
    }

    // Apply sorting based on orderBy and orderDirection
    if (orderBy) {
      data = data.sort((a, b) => {
        const order = orderDirection === 'DESC' ? -1 : 1;
        if (a[orderBy] < b[orderBy]) return -order;
        if (a[orderBy] > b[orderBy]) return order;
        return 0;
      });
    }

    // Apply pagination
    const total = data.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      hasNext: endIndex < total,
    };
  }



}
