import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaginationResult } from 'src/common/interfaces/pagination-result.interface';
import { UserEntity } from './entities/user.entity';
import { PaginationOptions } from 'src/common/interfaces/pagination-options.interface';
import { RolesGuard } from 'src/guards/roles.guard';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from 'src/roles.decorator';
import { UserRole } from 'src/common/enums/roles.enum';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@ApiTags('users')
@Controller('users')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN) 
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('workingHours')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
async getAgentWorkingHoursAndBreakTime(@Req() req: AuthenticatedRequest) {
  const agentId = req.user.id;  // Get the agentId from the authenticated request (token)
  return this.usersService.getAgentWorkingHoursAndBreakTime(agentId);
}

  @Get()
  @ApiOperation({ summary: 'Get paginated users' })
  async findAll(@Query() query: FindAllUsersDto): Promise<PaginationResult<UserEntity>> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({id:id});
  }



  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }



}