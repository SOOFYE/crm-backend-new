import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
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
import { S3Service } from '../s3/s3.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('users')
@Controller('users')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,

  ) {}

  @Post()
  //@Roles(UserRole.ADMIN) 
  @ApiOperation({ summary: 'Create a new user' })
  @UseInterceptors(FileInterceptor('cnic_photo'))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() cnicPhotoFile: Express.Multer.File,
  ) {

    console.log(createUserDto)

    let cnicPhotoUrl: string = null;

    // If a CNIC photo file was provided, upload it to S3
    if (cnicPhotoFile) {
      const uploadedFile = await this.s3Service.uploadFile('cnic_photos', cnicPhotoFile);
      cnicPhotoUrl = uploadedFile.s3Url; // Get the uploaded file URL
    }

    // Pass the CNIC photo URL to the createUserDto
    const updatedCreateUserDto = { ...createUserDto, cnic_photo: cnicPhotoUrl };

    return this.usersService.create(updatedCreateUserDto);
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
  @UseInterceptors(FileInterceptor('cnic_photo')) // Interceptor to handle file uploads
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() cnicPhotoFile?: Express.Multer.File,  // Handle file uploads
  ) {
    let cnicPhotoUrl: string | undefined = undefined;

    // If a new CNIC photo is uploaded, upload to S3 and get the URL
    if (cnicPhotoFile) {
      const uploadedPhoto = await this.s3Service.uploadFile('cnic-photos', cnicPhotoFile);
      cnicPhotoUrl = uploadedPhoto.s3Url;  // Save the new photo URL
    }

    // Pass the cnicPhotoUrl to the update function (null if no new file)
    return this.usersService.update(id, updateUserDto, cnicPhotoUrl);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }



}