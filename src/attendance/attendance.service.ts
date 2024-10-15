import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AttendanceEntity } from './entities/attendance.entity';
import { UsersService } from '../users/users.service';
import { Redis } from 'ioredis';
import { AttendanceStatusEnum } from '../common/enums/attendance-status.enum';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { isBefore, isAfter, addDays, set, addMinutes, isSameDay, startOfDay, endOfDay, differenceInHours } from 'date-fns';

import { DateTime } from 'luxon';
import { AbsenteeStatusEnum } from '../common/enums/absentee-status.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity) private attendanceRepo: Repository<AttendanceEntity>,
    private userService: UsersService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

    // Fetch attendance logs for the last X days
    async getAttendanceLogs(agentId: string, days: number = 30): Promise<AttendanceEntity[]> {
      const currentTime = this.getCurrentTimeInPKT();
      const pastDate = new Date(currentTime);
      pastDate.setDate(currentTime.getDate() - days);
      const pastDateInPKT = this.getCurrentTimeInPKTForDate(pastDate);
      
      // Fetch attendance logs within the specified date range
      const logs = await this.attendanceRepo.find({
        where: {
          agent: { id: agentId },
          date: Between(pastDateInPKT, currentTime),
        },
        relations: ['agent'],
        order: { date: 'DESC' },
      });
      
      return logs;
    }
  
// Clock-In logic with date and time merging for correct date and time calculations
async clockIn(agentId: string): Promise<void> {
  const currentTime = new Date(); // Use the current time
  const workDate = this.getWorkDate(currentTime); // Extract the workday date

  const agent = await this.userService.findOne({ id: agentId });
  if (!agent) return;

  // Merge the agent's work start time with the work date
  let workStartTime = this.mergeDateAndTime(workDate, agent.workingStartTime);
  let workEndTime = this.mergeDateAndTime(workDate, agent.workingEndTime);

  // Handle overnight shifts (if workEndTime is earlier than workStartTime, it spans midnight)
  if (isBefore(agent.workingEndTime, agent.workingStartTime)) {
    workEndTime = addDays(workEndTime, 1);
  }

  // Check if the agent has already clocked in for the current or previous workday
  const existingAttendance = await this.attendanceRepo.findOne({
    where: { agent: { id: agentId }, date: Between(workStartTime, workEndTime) },
  });

  if (existingAttendance && existingAttendance.clockIn) {
    throw new Error('You have already clocked in during your current shift');
  }

  // Determine clock-in status
  let clockInStatus: AttendanceStatusEnum;
  if (isBefore(currentTime, workStartTime)) {
    clockInStatus = AttendanceStatusEnum.CLOCKED_IN_EARLY;
  } else if (isBefore(currentTime, addMinutes(workStartTime, 5))) {
    clockInStatus = AttendanceStatusEnum.CLOCKED_IN_ON_TIME;
  } else {
    clockInStatus = AttendanceStatusEnum.CLOCKED_IN_LATE;
  }

  // Create and save the attendance log
  const newAttendance = this.attendanceRepo.create({
    agent,
    date: workDate,
    clockIn: currentTime,
    absenteeStatus: AbsenteeStatusEnum.PRESENT,
    clockInStatus,
  });

  await this.attendanceRepo.save(newAttendance);
}

async clockOut(agentId: string): Promise<void> {
  const currentTime = this.getCurrentTimeInPKT(); // Use the current time in PKT
  const agent = await this.userService.findOne({ id: agentId });

  if (!agent) {
    throw new Error('Agent not found');
  }

  // Extract the current workday date
  const currentWorkDate = this.getWorkDate(currentTime); 

  // Merge the agent's work start and end times with the correct date (handle past midnight)
  let workStartTime = this.mergeDateAndTime(currentWorkDate, agent.workingStartTime);
  let workEndTime = this.mergeDateAndTime(currentWorkDate, agent.workingEndTime);

  // Handle overnight shifts (work ends after midnight)
  if (isBefore(agent.workingEndTime, agent.workingStartTime)) {
    workEndTime = addDays(workEndTime, 1); // Extend work end time to the next day
  }

  // Now we check whether the current time falls within the work shift of the *previous day*
  const previousWorkDate = addDays(currentWorkDate, -1);
  const previousWorkStartTime = this.mergeDateAndTime(previousWorkDate, agent.workingStartTime);
  let previousWorkEndTime = this.mergeDateAndTime(previousWorkDate, agent.workingEndTime);

  // Handle overnight shift for the previous day
  if (isBefore(agent.workingEndTime, agent.workingStartTime)) {
    previousWorkEndTime = addDays(previousWorkEndTime, 1);
  }

  // Check if current time is still within the previous day's work shift
  if (isBefore(currentTime, workStartTime) && isAfter(currentTime, previousWorkStartTime)) {
    // We're still in the previous day's work shift
    const previousDayAttendance = await this.attendanceRepo.findOne({
      where: { agent: { id: agentId }, date: previousWorkDate }
    });

    if (!previousDayAttendance || !previousDayAttendance.clockIn) {
      throw new Error('You must clock in before clocking out');
    }

    // Determine the clock-out status based on the current time and previous work end time
    let clockOutStatus: AttendanceStatusEnum;
    if (isBefore(currentTime, previousWorkEndTime)) {
      clockOutStatus = AttendanceStatusEnum.CLOCKED_OUT_EARLY;
    } else {
      clockOutStatus = AttendanceStatusEnum.CLOCKED_OUT_ON_TIME;
    }

    // Update the attendance record with clock-out time and status for the previous day
    previousDayAttendance.clockOut = currentTime;
    previousDayAttendance.clockOutStatus = clockOutStatus;
    previousDayAttendance.hoursWorked = differenceInHours(previousDayAttendance.clockOut, previousDayAttendance.clockIn);

    // Save the updated attendance record
    await this.attendanceRepo.save(previousDayAttendance);
    return;
  }

  // Now we handle the case where the current time falls within the current day's work shift
  const currentDayAttendance = await this.attendanceRepo.findOne({
    where: { agent: { id: agentId }, date: currentWorkDate }
  });

  if (!currentDayAttendance || !currentDayAttendance.clockIn) {
    throw new Error('You must clock in before clocking out');
  }

  // Determine the clock-out status based on the current time and current work end time
  let currentClockOutStatus: AttendanceStatusEnum;
  if (isBefore(currentTime, workEndTime)) {
    currentClockOutStatus = AttendanceStatusEnum.CLOCKED_OUT_EARLY;
  } else {
    currentClockOutStatus = AttendanceStatusEnum.CLOCKED_OUT_ON_TIME;
  }

  // Update the attendance record with clock-out time and status for the current day
  currentDayAttendance.clockOut = currentTime;
  currentDayAttendance.clockOutStatus = currentClockOutStatus;
  currentDayAttendance.hoursWorked = differenceInHours(currentDayAttendance.clockOut, currentDayAttendance.clockIn);

  // Save the updated attendance record
  await this.attendanceRepo.save(currentDayAttendance);
}



async viewAttendanceLogsAdmin(agentId: string, startDate: Date, endDate?: Date): Promise<AttendanceEntity[]> {
  const start = this.getCurrentTimeInPKTForDate(startDate);
  const end = endDate ? this.getCurrentTimeInPKTForDate(endDate) : start;

  const logs = await this.attendanceRepo.find({
      where: {
          agent: agentId ? { id: agentId } : undefined,
          date: Between(start, end),
      },
      relations: ['agent'],
  });

  return logs.length ? logs : [];
}

async editAttendanceLog(
  logId: string,
  agentId: string,
  date: Date,
  updateData: Partial<AttendanceEntity>,
): Promise<AttendanceEntity> {

  if (!Object.values(AbsenteeStatusEnum).includes(updateData.absenteeStatus)) {
    throw new Error(`Invalid absentee status: ${updateData.absenteeStatus}`);
  }

  // Convert incoming date to the start of the day in PKT timezone
  const workDate = this.convertToPKT(startOfDay(date));


    // Fetch the agent's working hours to recalculate status
    const agent = await this.userService.findOne({ id: agentId });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }


  

  // Fetch the existing attendance log for the agent 
  const attendance = await this.attendanceRepo.findOne({
    where: { id: logId, agent: { id: agentId }},
  });

  if (!attendance) {
    throw new NotFoundException('Attendance log not found');
  }

  attendance.absenteeStatus = updateData.absenteeStatus;

  // Handle status for `absent` and `leave`
  if (updateData.absenteeStatus === AbsenteeStatusEnum.ABSENT || updateData.absenteeStatus === AbsenteeStatusEnum.LEAVE) {
    
    // Set clock-in and clock-out times and statuses to null when marked absent or on leave
    attendance.clockIn = null;
    attendance.clockOut = null;
    attendance.clockInStatus = null;
    attendance.clockOutStatus = null;
    
    // Save the updated attendance log with the updated status
    return this.attendanceRepo.save(attendance);
  }
  




    // If the date is being changed, check if there's another log with the same agent and the new date
    if (date && !isSameDay(attendance.date, workDate)) {
      const existingLog = await this.attendanceRepo.findOne({
        where: { agent: { id: agentId }, date: workDate },
      });
  
      if (existingLog) {
        throw new BadRequestException('An attendance log for this agent already exists on this date');
      }
    }

  // Merge the agent's working start and end times with the correct date
  const workStartTime = this.mergeDateAndTime(workDate, agent.workingStartTime);
  let workEndTime = this.mergeDateAndTime(workDate, agent.workingEndTime);

  // Handle overnight shifts by adding a day if the shift ends after midnight
  if (isBefore(agent.workingEndTime, agent.workingStartTime)) {
    workEndTime = addDays(workEndTime, 1);
  }

  // Validate that clockIn is before clockOut
  if (updateData.clockIn && updateData.clockOut) {
    const clockIn = this.convertToPKT(updateData.clockIn);
    const clockOut = this.convertToPKT(updateData.clockOut);

    // Ensure that clockOut is after clockIn (even for overnight shifts)
    if (isAfter(clockIn, clockOut)) {
      throw new BadRequestException('Clock-in time cannot be after clock-out time');
    }
  }

  // Update clock-in and clock-out times (if provided)
  if (updateData.clockIn) {

    const clockInDate = this.convertToPKT(updateData.clockIn);
    const clockInDatePart = startOfDay(clockInDate); // Get only the date part
    const workDatePart = startOfDay(workDate); // Get only the date part

    if (isAfter(clockInDatePart, workDatePart)) {
      throw new BadRequestException('Clock-in date cannot be later than the attendance log date');
    }


    attendance.clockIn = updateData.clockIn;
  }
  if (updateData.clockOut) {
    let clockOut = new Date(updateData.clockOut);
    
    // Check if the clock-out is for the next day (overnight shift)
    if (isAfter(clockOut, workEndTime)) {
      clockOut = addDays(clockOut, 1);
    }
    
    attendance.clockOut = clockOut
  }

  // Recalculate the attendance status based on updated times
  if (attendance.clockIn) {
    attendance.clockInStatus = this.calculateClockInStatus(attendance.clockIn, workStartTime);
  }
  if (attendance.clockOut) {
    attendance.clockOutStatus = this.calculateClockOutStatus(attendance.clockOut, workEndTime);
  }

  // Save the updated attendance record
  return this.attendanceRepo.save(attendance);
}
  
async createAttendanceLog(agentId: string, date: Date, logData: Partial<AttendanceEntity>): Promise<AttendanceEntity> {
  // Convert the incoming date to the start of the day in PKT
  const workDate = this.convertToPKT(startOfDay(date));

  // Check if an attendance log already exists for the agent on the selected date
  const existingLog = await this.attendanceRepo.findOne({
    where: { agent: { id: agentId }, date: workDate },
  });

  if (existingLog) {
    throw new BadRequestException('Attendance log already exists for this agent on the selected date');
  }

  // Fetch the agent's details
  const agent = await this.userService.findOne({ id: agentId });
  if (!agent) {
    throw new NotFoundException('Agent not found');
  }

  // Merge the agent's working start and end times with the correct date
  const workingStartTime = this.mergeDateAndTime(workDate, agent.workingStartTime);
  let workingEndTime = this.mergeDateAndTime(workDate, agent.workingEndTime);

  // Handle overnight shifts by adding a day if the shift ends after midnight
  if (isBefore(agent.workingEndTime, agent.workingStartTime)) {
    workingEndTime = addDays(workingEndTime, 1);
  }

  // Calculate the attendance status based on clockIn and clockOut times
  if (logData.clockIn) {

    const clockInDate = this.convertToPKT(logData.clockIn);
    const clockInDatePart = startOfDay(clockInDate); // Get only the date part
    const workDatePart = startOfDay(workDate); // Get only the date part

    if (isAfter(clockInDatePart, workDatePart)) {
      throw new BadRequestException('Clock-in date cannot be later than the attendance log date');
    }


    const clockIn = logData.clockIn; // Merge date and time

    logData.clockInStatus = this.calculateClockInStatus(clockIn, workingStartTime);

    // if (isBefore(clockIn, workingStartTime)) {
    //   logData.clockInStatus = AttendanceStatusEnum.CLOCKED_IN_EARLY;
    // } else if (isBefore(clockIn, addMinutes(workingStartTime, 5))) {
    //   logData.clockInStatus = AttendanceStatusEnum.CLOCKED_IN_ON_TIME;
    // } else {
    //   logData.clockInStatus = AttendanceStatusEnum.CLOCKED_IN_LATE;
    // }
  }

  if (logData.clockOut) {
    const clockOut = logData.clockOut // Merge date and time

    logData.clockOutStatus = this.calculateClockOutStatus(clockOut, workingEndTime);
    
    // // If clockOut is on the next day and within the allowed range, calculate accordingly
    // if (isAfter(clockOut, workingEndTime) && isBefore(clockOut, addDays(workingEndTime, 1))) {
    //   logData.clockOutStatus = AttendanceStatusEnum.CLOCKED_OUT_ON_TIME;
    // } else if (isBefore(clockOut, workingEndTime)) {
    //   logData.clockOutStatus = AttendanceStatusEnum.CLOCKED_OUT_EARLY;
    // }
  }

  // Create a new attendance log
  const newLog = this.attendanceRepo.create({
    agent: { id: agentId },
    date: workDate,
    clockIn: logData.clockIn ? logData.clockIn : null,
    clockOut: logData.clockOut ?logData.clockOut : null,
    absenteeStatus: logData.absenteeStatus==='absent'? AbsenteeStatusEnum.ABSENT : logData.absenteeStatus==='leave' ? AbsenteeStatusEnum.LEAVE : AbsenteeStatusEnum.PRESENT,
    clockInStatus: logData.clockInStatus?logData.clockInStatus: null ,
    clockOutStatus: logData.clockOutStatus?logData.clockOutStatus: null,
  });

  // Save the attendance log in the repository
  return this.attendanceRepo.save(newLog);
}



    
async downloadAttendanceLogsCSV(): Promise<string> {
  const logs = await this.attendanceRepo.find({ relations: ['agent'] });
  console.log(logs)
  
  if (!logs.length) {
    throw new NotFoundException('No attendance logs found');
  }

  // Pivot data to get unique agent names and their attendance statuses by date
  const agentData: { [agentId: string]: any } = {};
  const uniqueDates = new Set<string>();

  logs.forEach(log => {
    const agentId = log.agent.id;
    const agentName = `${log.agent.firstname} ${log.agent.lastname}`;
    const logDate = new Date(log.date).toLocaleDateString('en-US'); // Format date as MM/DD/YYYY
    uniqueDates.add(logDate);

    if (!agentData[agentId]) {
      agentData[agentId] = { name: agentName };
    }

    // Determine the status for the day based on clockInStatus and clockOutStatus
    let status = 'N/A'; // Default to N/A
    if (log.absenteeStatus === AbsenteeStatusEnum.ABSENT) {
      status = 'Absent';
    } else if (log.absenteeStatus === AbsenteeStatusEnum.LEAVE) {
      status = 'Leave';
    } else if (log.absenteeStatus === AbsenteeStatusEnum.PRESENT && (log.clockInStatus === AttendanceStatusEnum.CLOCKED_IN_ON_TIME || log.clockInStatus === AttendanceStatusEnum.CLOCKED_IN_EARLY)) {
      status = 'Present';
    } else if (log.absenteeStatus === AbsenteeStatusEnum.PRESENT && log.clockInStatus === AttendanceStatusEnum.CLOCKED_IN_LATE) {
      status = 'Late';
    }

    // Store status for the specific date
    agentData[agentId][logDate] = status;
  });

  // Prepare the CSV rows
  const datesArray = Array.from(uniqueDates).sort(); // Sort dates for column headers
  const headers = ['Agent Name', ...datesArray]; // CSV headers
  const rows = Object.values(agentData).map(agent => {
    const row = [agent.name];
    datesArray.forEach(date => {
      row.push(agent[date] || 'N/A'); // Fill with 'N/A' if no status is available for a date
    });
    return row;
  });

  console.log(headers,rows)

  // Format the CSV string
  const csvString = this.formatCSV(headers, rows);
  return csvString;
}

// Helper method to format CSV with headers and rows
private formatCSV(headers: string[], rows: string[][]): string {
  const csvRows = rows.map(row => row.join(',')); // Convert each row array to a comma-separated string
  return [headers.join(','), ...csvRows].join('\r\n'); // Join headers and rows into a CSV format
}


async getStatus(agentId: string): Promise<{ status: string; message: string }> {
  try {
    const currentTime = this.getCurrentTimeInPKT(); // Get the current time in PKT
    const agent = await this.userService.findOne({ id: agentId });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // Determine the agent's work start and end times for today
    const workDate = startOfDay(currentTime); // Start of the calendar day (midnight)
    const agentStartTime = this.mergeDateAndTime(workDate, agent.workingStartTime);
    let agentEndTime = this.mergeDateAndTime(workDate, agent.workingEndTime);

    // Handle overnight shifts where the work shift spans into the next day
    if (isBefore(agent.workingEndTime, agent.workingStartTime)) {
      agentEndTime = addDays(agentEndTime, 1); // Extend end time to the next day
    }

    // Check if the current time is within the previous day's work shift
    if (isBefore(currentTime, agentEndTime) && isAfter(currentTime, agentStartTime)) {
      // If the current time is within the work shift, check the current workday attendance
      const currentAttendance = await this.getWorkdayAttendance(agentId, workDate);

      // Handle clock-out scenario
      if (currentAttendance.clockOut) {
        return {
          status: 'clocked-out',
          message: 'You have already clocked out for this workday.',
        };
      }

      // Handle clock-in scenario
      if (currentAttendance.clockIn) {
        return {
          status: 'clocked-in',
          message: 'You are currently clocked in. You can clock out when ready.',
        };
      }
    } else if (isBefore(currentTime, agentStartTime)) {
      // If current time is before the work start time, check if the previous workday is still valid
      const previousWorkDate = addDays(workDate, -1); // Previous calendar day
      const previousAttendance = await this.getWorkdayAttendance(agentId, previousWorkDate);

      // Handle previous workday scenarios
      if (previousAttendance.clockOut) {
        return {
          status: 'clocked-out',
          message: 'You have already clocked out for your previous workday.',
        };
      }

      if (previousAttendance.clockIn) {
        return {
          status: 'clocked-in',
          message: 'You are still clocked in from your previous workday. You can clock out now.',
        };
      }
    }

    // Now, check for the current day's workday attendance (if current time has passed agentStartTime)
    const attendance = await this.getWorkdayAttendance(agentId, agentStartTime);

    // Check absenteeStatus (absent or leave)
    if (attendance.absenteeStatus === AbsenteeStatusEnum.ABSENT) {
      return {
        status: 'absent',
        message: 'You have been marked as absent for today.',
      };
    }

    if (attendance.absenteeStatus === AbsenteeStatusEnum.LEAVE) {
      return {
        status: 'leave',
        message: 'You are on leave today.',
      };
    }

    // Handle clock-out scenario
    if (attendance.clockOut) {
      return {
        status: 'clocked-out',
        message: 'You have already clocked out for today.',
      };
    }

    // Handle clock-in scenario
    if (attendance.clockIn) {
      return {
        status: 'clocked-in',
        message: 'You are currently clocked in. You can clock out when ready.',
      };
    }

    // If neither clock-in nor clock-out exist, allow clock-in
    return {
      status: 'not-clocked-in',
      message: 'You have not clocked in today. Please clock in to start your day.',
    };

  } catch (error) {
    if (error instanceof NotFoundException) {
      return {
        status: 'no-record',
        message: 'No attendance record found for today. You need to clock in.',
      };
    }
    throw error;
  }
}
 

  

  
  private async getWorkdayAttendance(agentId: string, currentTime: Date): Promise<AttendanceEntity> {
    // Fetch the agent's details
    const agent = await this.userService.findOne({ id: agentId });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
  
    // Convert the agent's working start and end times to PKT
    const workingStartTime = this.convertToPKT(agent.workingStartTime);
    const workingEndTime = this.convertToPKT(agent.workingEndTime);

  
    // Determine if the working end time is on the next day (overnight shift)
    let startDate = startOfDay(currentTime); // Get the start of the day for currentTime
    let endDate = endOfDay(currentTime);
  
    // If working end time is earlier than working start time, it's an overnight shift
    if (isBefore(workingEndTime, workingStartTime)) {
      // Extend the end time to the next day to handle overnight shifts
      endDate = addDays(endOfDay(currentTime), 1);
    }
  
    // Find the attendance log within the working hours range
    const attendance = await this.attendanceRepo.findOne({
      where: { agent: { id: agentId }, date: Between(startDate, endDate) },
    });
  
    if (!attendance) {
      throw new NotFoundException('No attendance record found for this workday');
    }
  
    return attendance;
  }
 


// TODO: make private
  public getCurrentTimeInPKT(): Date {
    const timeZone = 'Asia/Karachi';
    const currentTime = new Date();
    return toZonedTime(currentTime, timeZone);
  }

  private getCurrentTimeInPKTForDate(date: Date): Date {
    const timeZone = 'Asia/Karachi';
    return toZonedTime(date, timeZone);
  }


  convertToPKT(date: Date | string): Date {
    if (!date) {
      throw new Error("Invalid date provided");
    }
  
    let parsedDate;
    
    // Check if the input is a string or Date object
    if (typeof date === 'string') {
      parsedDate = DateTime.fromISO(date, { zone: 'Asia/Karachi' });
    } else if (date instanceof Date) {
      parsedDate = DateTime.fromJSDate(date).setZone('Asia/Karachi');
    } else {
      throw new Error("Unsupported date format");
    }
  
    // Check if the parsed date is valid
    if (!parsedDate.isValid) {
      throw new Error("Failed to convert date to PKT");
    }
  
    return parsedDate.toJSDate();
  }
  
  calculateClockInStatus(clockIn: Date, workStartTime: Date): AttendanceStatusEnum {
    if (isBefore(clockIn, workStartTime)) {
      return AttendanceStatusEnum.CLOCKED_IN_EARLY;
    } else if (isBefore(clockIn, addMinutes(workStartTime, 5))) {
      return AttendanceStatusEnum.CLOCKED_IN_ON_TIME;
    } else {
      return AttendanceStatusEnum.CLOCKED_IN_LATE;
    }
  }
  
  calculateClockOutStatus(clockOut: Date, workEndTime: Date): AttendanceStatusEnum {
    // Adjust workEndTime to allow for clocking out on the next day if necessary
    let adjustedWorkEndTime = workEndTime;
  
    if (isBefore(workEndTime, clockOut)) {
      // If clockOut is after workEndTime, consider overnight shifts
      adjustedWorkEndTime = addDays(workEndTime, 1); // Allow clockOut on the next day
    }
  
    // Handle clockOut
    if (isBefore(clockOut, adjustedWorkEndTime)) {
      console.log(clockOut, " ", adjustedWorkEndTime);
      return AttendanceStatusEnum.CLOCKED_OUT_EARLY;
    } else {
      console.log(clockOut, " ", adjustedWorkEndTime);
      return AttendanceStatusEnum.CLOCKED_OUT_ON_TIME;
    }
  }

  getWorkDate(date: Date): Date {
    return startOfDay(date);
  }

   mergeDateAndTime(date: Date, time: Date): Date {
    // Extract the hours, minutes, and seconds from time
    return set(date, {
      hours: time.getHours(),
      minutes: time.getMinutes(),
      seconds: time.getSeconds(),
      milliseconds: 0,
    });

}

 isWithinWorkday(currentTime, workStartTime, workEndTime) {
  // If workEndTime is on the next day (overnight shift), add a day to the comparison
  if (isBefore(workEndTime, workStartTime)) {
    workEndTime = addDays(workEndTime, 1);
  }
  return isBefore(workStartTime, currentTime) && isBefore(currentTime, workEndTime);
}


}