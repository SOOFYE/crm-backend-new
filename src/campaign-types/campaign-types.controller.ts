import { UseGuards, Controller, Post, Body, Get, Query, Param, Patch, Delete } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserRole } from "../common/enums/roles.enum";
import { PaginationResult } from "../common/interfaces/pagination-result.interface";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../roles.decorator";
import { CampaignTypesService } from "./campaign-types.service";
import { CreateCampaignTypeDto } from "./dto/create-campaign-type.dto";
import { FindAllCampaignTypesDto } from "./dto/find-all-campaignTypes.dto";
import { UpdateCampaignTypeDto } from "./dto/update-campaign-type.dto";
import { CampaignTypeEntity } from "./entities/campaign-type.entity";


@ApiTags('campaign-types')
//@ApiBearerAuth() // Enables Bearer token input in Swagger
//@UseGuards(JwtAuthGuard, RolesGuard) // Applies JWT and RolesGuard to all routes
@Controller('campaign-types')
export class CampaignTypesController {
  constructor(private readonly campaignTypesService: CampaignTypesService) {}

  @Post()
  //@Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new campaign type' })
  @ApiResponse({ status: 201, description: 'The campaign type has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  create(@Body() createCampaignTypeDto: CreateCampaignTypeDto) {
    return this.campaignTypesService.create(createCampaignTypeDto);
  }

  @Get()
  //@Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all campaign types with pagination' })
  @ApiResponse({ status: 200, description: 'Return all campaign types.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@Query() findAllDto: FindAllCampaignTypesDto): Promise<PaginationResult<CampaignTypeEntity>> {
    
    return this.campaignTypesService.findAll(findAllDto);
  }

  @Get(':id')
  //@Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific campaign type by ID' })
  @ApiResponse({ status: 200, description: 'Return the campaign type.' })
  @ApiResponse({ status: 404, description: 'Campaign type not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOne(@Param('id') id: string) {
    return this.campaignTypesService.findOne({ id });
  }

  @Patch(':id')
  //@Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a specific campaign type by ID' })
  @ApiResponse({ status: 200, description: 'The campaign type has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Campaign type not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  update(@Param('id') id: string, @Body() updateCampaignTypeDto: UpdateCampaignTypeDto) {
    return this.campaignTypesService.update(id, updateCampaignTypeDto);
  }

  @Delete(':id')
  //@Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a specific campaign type by ID' })
  @ApiResponse({ status: 200, description: 'The campaign type has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Campaign type not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  remove(@Param('id') id: string) {
    return this.campaignTypesService.remove(id);
  }
}
