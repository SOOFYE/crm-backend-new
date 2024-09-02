import { Controller, Post, Body, Param, Get } from '@nestjs/common';

import { CreateRescheduledCallDto } from './dto/create-rescheduled-call.dto';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { RescheduledCallsService } from './rescheduled-calls.service';


@ApiTags('Rescheduled Calls')
@Controller('rescheduled-calls')
export class RescheduledCallsController {
  constructor(private readonly rescheduledCallService: RescheduledCallsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a rescheduled call' })
  async createRescheduledCall(
    @Body() createRescheduledCallDto: CreateRescheduledCallDto,
  ) {
    return this.rescheduledCallService.create(createRescheduledCallDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a rescheduled call by ID' })
  async getRescheduledCall(@Param('id') id: string) {
    return this.rescheduledCallService.findById(id);
  }

  // Implement other endpoints as needed...
}
