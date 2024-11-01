import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PaginationResult } from '../common/interfaces/pagination-result.interface'; 
import { PaginationUtil } from '../utils/pagination.util'; 
import { UserRole } from '../common/enums/roles.enum'; 
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
      const existingUser = await this.usersRepository.findOne({ where: { username: createUserDto.username } });
      if (existingUser) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: 'Username already exists!',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create the new user entity
      const user = this.usersRepository.create({
        ...createUserDto,
        role: UserRole.AGENT,
        cnic_photo: createUserDto.cnic_photo || null, // Save CNIC photo URL if provided
      });

      // Save the user entity
      return await this.usersRepository.save(user);
    } catch (error) {
      throw error;
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


  async findAllNoPagination(criteria: FindOptionsWhere<UserEntity>): Promise<UserEntity[]> {
    try {
      const users = await this.usersRepository.find({ where: criteria });
      return users;
    } catch (error) {
      
      console.log(error)
      
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

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    cnicPhotoUrl?: string,  // Optional CNIC photo URL
  ): Promise<UserEntity> {
    const user = await this.findOne({id:id});

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update the user's details
    Object.assign(user, updateUserDto);

    // Update CNIC photo URL if provided
    if (cnicPhotoUrl) {
      user.cnic_photo = cnicPhotoUrl;
    }

    // Save and return the updated user
    return this.usersRepository.save(user);
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




  async getAgentWorkingHoursAndBreakTime(agentId: string) {
    // Fetch agent from the database to get their working hours and break times
    const agent = await this.findOne({ id: agentId });
  
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
  
    return {
      workingStartTime: agent.workingStartTime, // Assuming this is the time the agent starts
      workingEndTime: agent.workingEndTime,     // Assuming this is the time the agent ends
      allowedBreakTime: agent?.allowedBreakTimePerDay.toString() || null, // Break time per day
    };
  }


}