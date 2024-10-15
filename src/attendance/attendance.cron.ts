import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceEntity } from './entities/attendance.entity';
import { UsersService } from '../users/users.service';
import { Cron } from '@nestjs/schedule';
import { AttendanceStatusEnum } from '../common/enums/attendance-status.enum';
import { AbsenteeStatusEnum } from '../common/enums/absentee-status.enum';
import { toZonedTime } from 'date-fns-tz';
import { isBefore, addMinutes, set, addDays, startOfDay } from 'date-fns';
import { UserRole } from '../common/enums/roles.enum';

@Injectable()
export class AttendanceCRONService {
  constructor(
    @InjectRepository(AttendanceEntity) private attendanceRepo: Repository<AttendanceEntity>,
    private userService: UsersService,
  ) {}

  // Run this service every hour to check for late employees
  @Cron('0 0 * * *') // Every hour at the start of the hour
  async markAbsentIfLate(): Promise<void> {
    // Get all agents
    const agents = await this.userService.findAllNoPagination({ role: UserRole.AGENT });

    for (const agent of agents) {
      // Get current date/time and convert to PKT time zone
      const currentTime = this.getCurrentTimeInPKT();
      const workDate = startOfDay(currentTime); // Work date starts at midnight PKT

      // Merge agent's work start time with today's date
      const workStartTime = this.mergeDateAndTime(workDate, agent.workingStartTime);
      let workEndTime = this.mergeDateAndTime(workDate, agent.workingEndTime);

      // Handle overnight shifts (shift end time is before the start time)
      if (isBefore(agent.workingEndTime, agent.workingStartTime)) {
        workEndTime = addDays(workEndTime, 1); // Shift ends next day
      }

      // Define the 30-minute grace period after work start time
      const gracePeriodEnd = addMinutes(workStartTime, 30);

      // Check if current time is after the grace period
      if (isBefore(currentTime, gracePeriodEnd)) {
        continue; // Agent is still within grace period, skip this check
      }

      // Fetch attendance log for today
      const attendance = await this.attendanceRepo.findOne({
        where: { agent: { id: agent.id }, date: workDate },
      });

      // Check if agent has not clocked in
      if (!attendance || !attendance.clockIn) {
        // Mark the agent as absent if they have not clocked in by grace period end
        await this.markAgentAbsent(agent.id, workDate);
      }
    }
  }

  // Function to mark the agent as absent
  private async markAgentAbsent(agentId: string, date: Date): Promise<void> {
    // Fetch or create an attendance log
    let attendance = await this.attendanceRepo.findOne({ where: { agent: { id: agentId }, date } });

    if (!attendance) {
      // Create a new attendance log if none exists
      attendance = this.attendanceRepo.create({
        agent: { id: agentId },
        date,
        absenteeStatus: AbsenteeStatusEnum.ABSENT, // Mark as absent
      });
    } else {
      // Update existing log to mark as absent
      attendance.absenteeStatus = AbsenteeStatusEnum.ABSENT;
    }

    // Save the updated attendance log
    await this.attendanceRepo.save(attendance);
  }

  // Utility function to get current time in PKT time zone
  private getCurrentTimeInPKT(): Date {
    return toZonedTime(new Date(), 'Asia/Karachi');
  }

  // Utility function to merge date and time
  mergeDateAndTime(date: Date, time: Date): Date {
    // Extract the hours, minutes, and seconds from time
    return set(date, {
      hours: time.getHours(),
      minutes: time.getMinutes(),
      seconds: time.getSeconds(),
      milliseconds: 0,
    });
  }
}
