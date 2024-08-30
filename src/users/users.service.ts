import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationOptions } from 'src/common/interfaces/pagination-options.interface';
import { PaginationResult } from 'src/common/interfaces/pagination-result.interface';
import { PaginationUtil } from 'src/utils/pagination.util';
import { UserRole } from 'src/common/enums/roles.enum';
import { FindAllUsersDto } from './dto/find-all-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly paginationUtil: PaginationUtil,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    try {
      if(await this.findOne({username: createUserDto.username}))
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: "username already exists!",
          },
          HttpStatus.BAD_REQUEST,
        ); 
      const user = this.usersRepository.create({...createUserDto,role:UserRole.AGENT});
      return await this.usersRepository.save(user);
    } catch (error) {
      throw error
    }
  }

  async findAll(options: FindAllUsersDto): Promise<PaginationResult<UserEntity>> {
    try {
      return await this.paginationUtil.paginate(this.usersRepository, options);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error fetching users',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(criteria: FindOptionsWhere<UserEntity>): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOne({ where: criteria });
      return user;
    } catch (error) {
      
      console.log(error)
      
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error fetching user',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    try {
      // Check if the username is being updated
      if (updateUserDto.username) {
        // Check if another user with the same username exists
        const existingUser = await this.usersRepository.findOne({
          where: { username: updateUserDto.username },
        });
  
        if (existingUser && existingUser.id !== id) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              error: 'Username already exists',
            },
            HttpStatus.BAD_REQUEST,
          );
        }
      }
  
      // Preload the user entity with the updated data
      const user = await this.usersRepository.preload({
        id,
        ...updateUserDto,
      });
  
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
  
      // Save the updated user
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Error updating user with ID ${id}: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  
  async remove(id: string): Promise<void> {
    try {
      const user = await this.findOne({ id: id });
      await this.usersRepository.softRemove(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: `Error removing user with ID ${id}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}