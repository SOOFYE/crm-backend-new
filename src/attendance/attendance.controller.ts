import { Controller, Post, Body, Param, Patch, Get, Query, Req, UseGuards, Res, BadRequestException } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AttendanceEntity } from "./entities/attendance.entity";
import { AuthenticatedRequest } from "../common/interfaces/authenticated-request.interface";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Response } from "express";
import { Roles } from "../roles.decorator";

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  
  @Get('/logs')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAttendanceLogs(
    @Query('days') days: number = 30,   
    @Req() req: AuthenticatedRequest,   
  ): Promise<AttendanceEntity[]> {
    const agentId = req.user.id;        
    return this.attendanceService.getAttendanceLogs(agentId, days);
  }

 
  @Post('/clock-in')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async clockIn(@Req() req: AuthenticatedRequest): Promise<void> {
    const agentId = req.user.id;        
    return this.attendanceService.clockIn(agentId);
  }

 
  @Patch('/clock-out')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async clockOut(@Req() req: AuthenticatedRequest): Promise<void> {
    const agentId = req.user.id;        
    return this.attendanceService.clockOut(agentId);
  }

  
  @Get('/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getStatus(@Req() req: AuthenticatedRequest): Promise<{ status: string }> {
    const agentId = req.user.id;        
    return this.attendanceService.getStatus(agentId);
  }



  @Get('view')
  async viewLogs(
    @Query('agentId') agentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate?: string
  ) {
    return this.attendanceService.viewAttendanceLogsAdmin(agentId, new Date(startDate), endDate ? new Date(endDate) : undefined);
  }


  @Post('edit')
  async editLog(
    @Body('logId') logId: string,
    @Body('agentId') agentId: string,
    @Body('date') date: string,
    @Body() updateData: Partial<AttendanceEntity>
  ) {
    return this.attendanceService.editAttendanceLog(logId,agentId,new Date(date),updateData);
  }

  @Post('create-log')
  async createLog(
    @Body('agentId') agentId: string,
    @Body('date') date: string, 
    @Body() logData: Partial<AttendanceEntity>
  ): Promise<AttendanceEntity> {
    if (!agentId || !date) {
      throw new BadRequestException('Agent ID and date are required');
    }

    const parsedDate = new Date(date);

    return this.attendanceService.createAttendanceLog(agentId, parsedDate, logData);
  }


  @Get('download')
  async downloadCSV(@Res() res: Response) {
    const csv = await this.attendanceService.downloadAttendanceLogsCSV();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance_logs.csv"');
    res.send(csv); 
  }
}