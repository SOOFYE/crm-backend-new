import { Controller, Get, Query } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { HolidayEntity } from './entities/holiday.entity';

@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}



  @Get('month')
  async getHolidaysByMonth(
    @Query('month') month: number, // Query parameter for month (1 for January, 12 for December)
    @Query('year') year: number    // Query parameter for year
  ): Promise<HolidayEntity[]> {
    return await this.holidaysService.getHolidaysByMonth(month, year);
  }
}


