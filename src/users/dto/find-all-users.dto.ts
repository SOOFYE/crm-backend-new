import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsEnum, IsArray } from 'class-validator';
import { PaginationOptions } from 'src/common/interfaces/pagination-options.interface';
import { UserEntity } from '../entities/user.entity';
import { Type } from 'class-transformer';

export class FindAllUsersDto implements PaginationOptions<UserEntity> {


    @IsNumber()
    @Type(() => Number)  // Transform string to number
    @ApiPropertyOptional({ description: 'Page number', default: 1 })
    page: number = 1;


    @IsNumber()
    @Type(() => Number)  // Transform string to number
    @ApiPropertyOptional({ description: 'Limit of users per page', default: 10 })
    limit: number = 10;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Search keyword', type: String })
    searchKey?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @ApiPropertyOptional({ description: 'Fields to search by', type: [String], enum: ['firstname', 'lastname', 'username', 'email'] })
    searchField?: (keyof UserEntity)[];

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Field to order by', enum: ['firstname', 'lastname', 'username', 'email'] })
    orderBy?: keyof UserEntity;

    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    @ApiPropertyOptional({ description: 'Order direction', enum: ['ASC', 'DESC'] })
    orderDirection?: 'ASC' | 'DESC';

    @IsOptional()
    @ApiPropertyOptional({ description: 'Filters applied to the query', type: Object })
    filters?: Partial<UserEntity>;
}
