import { Module } from '@nestjs/common';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';
import { HolidayEntity } from './entities/holiday.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([HolidayEntity])], 
  controllers: [HolidaysController],
  providers: [HolidaysService],
  exports: [HolidaysService]
})
export class HolidaysModule {}
