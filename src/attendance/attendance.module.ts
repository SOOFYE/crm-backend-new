import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceEntity } from './entities/attendance.entity';
import { HolidaysModule } from '../holidays/holidays.module';
import { UsersModule } from '../users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AttendanceCRONService } from './attendance.cron';


@Module({
  imports: [TypeOrmModule.forFeature([AttendanceEntity]),HolidaysModule, UsersModule, ScheduleModule.forRoot(),  // Add ScheduleModule here
],
  controllers: [AttendanceController],
  providers: [AttendanceService,AttendanceCRONService],
})
export class AttendanceModule {}
