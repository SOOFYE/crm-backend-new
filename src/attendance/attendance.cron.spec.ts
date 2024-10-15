process.env.TZ = 'UTC';

// attendance.cron.spec.ts
import { AttendanceCRONService } from './attendance.cron';
import { UsersService } from '../users/users.service';
import { AttendanceEntity } from './entities/attendance.entity';
import { AttendanceStatusEnum } from '../common/enums/attendance-status.enum';
import { Repository } from 'typeorm';
import { addMinutes, set } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { UserEntity } from '../users/entities/user.entity';  // Import UserEntity
import { AttendanceService } from './attendance.service';

describe('AttendanceCRONService', () => {
  let service: AttendanceCRONService;
  let attendanceRepo: jest.Mocked<Repository<AttendanceEntity>>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(() => {
    // Mock dependencies
    attendanceRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    usersService = {
      findAllNoPagination: jest.fn(),
      findOne: jest.fn(),
    } as any;

    service = new AttendanceCRONService(attendanceRepo, usersService);
  });

  describe('calculateWorkDateAndAdjustTimes', () => {
    it('should calculate work date and times for normal day shift', () => {
      const workingStartTime = new Date(Date.UTC(2024, 9, 13, 9, 0, 0));
      const workingEndTime = new Date(Date.UTC(2024, 9, 13, 17, 0, 0));
      const currentTime = new Date(Date.UTC(2024, 9, 13, 12, 0, 0));
      
      const { workDate, adjustedStartTime, adjustedEndTime } = service.calculateWorkDateAndAdjustTimes(
        workingStartTime,
        workingEndTime,
        currentTime,
      );

      const expectedWorkDate = new Date(Date.UTC(2024, 9, 13, 0, 0, 0));
      expect(workDate.getTime()).toBe(expectedWorkDate.getTime());

      const expectedStartTime = new Date(Date.UTC(2024, 9, 13, 9, 0, 0));
      const expectedEndTime = new Date(Date.UTC(2024, 9, 13, 17, 0, 0));

      expect(adjustedStartTime.getTime()).toBe(expectedStartTime.getTime());
      expect(adjustedEndTime.getTime()).toBe(expectedEndTime.getTime());
    });

    it('should calculate work date and times for overnight shift', () => {
        const workingStartTime = new Date(Date.UTC(2024, 9, 12, 22, 0, 0)); // 2024-10-12 22:00 UTC
        const workingEndTime = new Date(Date.UTC(2024, 9, 13, 6, 0, 0));   // 2024-10-13 06:00 UTC
        const currentTime = new Date(Date.UTC(2024, 9, 13, 2, 0, 0));      // 2024-10-13 02:00 UTC
      
        // Mock getCurrentTimeInPKT
        jest.spyOn(service, 'getCurrentTimeInPKT').mockReturnValue(currentTime);
      
        const { workDate, adjustedStartTime, adjustedEndTime } = service.calculateWorkDateAndAdjustTimes(
          workingStartTime,
          workingEndTime,
          currentTime
        );
      
        // The workDate should still be the previous day (2024-10-12)
        const expectedWorkDate = new Date(Date.UTC(2024, 9, 12, 0, 0, 0));
        expect(workDate.getTime()).toBe(expectedWorkDate.getTime());
      
        // adjustedStartTime should be 2024-10-12 22:00 UTC
        const expectedStartTime = new Date(Date.UTC(2024, 9, 12, 22, 0, 0));
        expect(adjustedStartTime.getTime()).toBe(expectedStartTime.getTime());
      
        // adjustedEndTime should be 2024-10-13 06:00 UTC
        const expectedEndTime = new Date(Date.UTC(2024, 9, 13, 6, 0, 0));
        expect(adjustedEndTime.getTime()).toBe(expectedEndTime.getTime());
      });

      it('should handle late clock-ins', async () => {
        const workingStartTime = new Date(Date.UTC(2024, 9, 13, 9, 0, 0));
        const workingEndTime = new Date(Date.UTC(2024, 9, 13, 17, 0, 0));
        const currentTime = new Date(Date.UTC(2024, 9, 13, 10, 30, 0));
      
        usersService.findAllNoPagination.mockResolvedValue([
          {
            id: '9b4d3b92-003a-4ebc-985b-b80c9e86d194',
            workingStartTime,
            workingEndTime,
            firstname: 'test',
            lastname: 'test',
            email: 'test@test.com',
            username: 'test',
          } as UserEntity,
        ]);
      
        usersService.findOne.mockResolvedValue({
          id: '9b4d3b92-003a-4ebc-985b-b80c9e86d194',
          firstname: 'test',
          lastname: 'test',
          email: 'test@test.com',
          username: 'test',
        } as UserEntity);
      
        attendanceRepo.findOne.mockResolvedValue(null);
      
        // Mock getCurrentTimeInPKT
        jest.spyOn(service, 'getCurrentTimeInPKT').mockReturnValue(currentTime);
      
        await service.markAbsentIfLate();
      
        expect(attendanceRepo.create).toHaveBeenCalledWith({
          agent: { id: '9b4d3b92-003a-4ebc-985b-b80c9e86d194' },
          date: new Date(Date.UTC(2024, 9, 13, 0, 0, 0)),
          clockIn: null,
          clockOut: null,
          isLate: true,
          status: AttendanceStatusEnum.ABSENT,
        });
        expect(attendanceRepo.save).toHaveBeenCalled();
      });
  });
});


describe('calculateWorkDate', () => {
    let service: AttendanceService;
  
    beforeEach(() => {
      service = new AttendanceService(null, null, null); // No dependencies needed for this test
    });
  
    it('should return the current date for normal day shifts', () => {
      const workingStartTime = new Date(2024, 9, 13, 9, 0, 0); // 9 AM PKT
      const workingEndTime = new Date(2024, 9, 13, 17, 0, 0);  // 5 PM PKT
      const currentTime = new Date(2024, 9, 13, 12, 0, 0);     // Noon PKT
  
      const result = service.calculateWorkDate(workingStartTime, workingEndTime, currentTime);
  
      const expectedWorkDate = new Date(2024, 9, 13, 0, 0, 0); // Midnight PKT
  
      expect(result.getTime()).toBe(expectedWorkDate.getTime());
    });
  
    it('should return the previous day for overnight shifts', () => {
      const workingStartTime = new Date(2024, 9, 12, 22, 0, 0); // 10 PM PKT (Oct 12)
      const workingEndTime = new Date(2024, 9, 13, 6, 0, 0);   // 6 AM PKT (Oct 13)
      const currentTime = new Date(2024, 9, 13, 2, 0, 0);      // 2 AM PKT
  
      const result = service.calculateWorkDate(workingStartTime, workingEndTime, currentTime);
  
      const expectedWorkDate = new Date(2024, 9, 12, 0, 0, 0); // Midnight PKT (Oct 12)
  
      expect(result.getTime()).toBe(expectedWorkDate.getTime());
    });
  
    it('should return the current day for an overnight shift still in progress', () => {
      const workingStartTime = new Date(2024, 9, 12, 22, 0, 0); // 10 PM PKT (Oct 12)
      const workingEndTime = new Date(2024, 9, 13, 6, 0, 0);   // 6 AM PKT (Oct 13)
      const currentTime = new Date(2024, 9, 13, 5, 0, 0);      // 5 AM PKT
  
      const result = service.calculateWorkDate(workingStartTime, workingEndTime, currentTime);
  
      const expectedWorkDate = new Date(2024, 9, 12, 0, 0, 0); // Midnight PKT (Oct 12)
  
      expect(result.getTime()).toBe(expectedWorkDate.getTime());
    });
  });


  describe('clockIn', () => {
    let service: AttendanceService;
    let attendanceRepo: jest.Mocked<Repository<AttendanceEntity>>;
    let usersService: jest.Mocked<UsersService>;
  
    beforeEach(() => {
      attendanceRepo = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      } as any;
  
      usersService = {
        findOne: jest.fn(),
      } as any;
  
      service = new AttendanceService(attendanceRepo, usersService, null);
    });
  
    it('should allow valid clock-in', async () => {
        const agentId = 'agent123';
        const currentTime = new Date(Date.UTC(2024, 9, 13, 9, 5, 0));
      
        // Ensure workingStartTime and workingEndTime are defined
        usersService.findOne.mockResolvedValue({
          id: agentId,
          workingStartTime: new Date(Date.UTC(2024, 9, 13, 9, 0, 0)),
          workingEndTime: new Date(Date.UTC(2024, 9, 13, 17, 0, 0)),
        } as UserEntity);
      
        attendanceRepo.findOne.mockResolvedValue(null); // No existing clock-in
        
        jest.spyOn(service, 'getCurrentTimeInPKT').mockReturnValue(currentTime);
      
        await service.clockIn(agentId);
      
        expect(attendanceRepo.create).toHaveBeenCalledWith({
          agent: { id: agentId },
          date: expect.any(Date),
          clockIn: currentTime,
          isLate: false,
          status: AttendanceStatusEnum.CLOCKED_IN,
        });
        expect(attendanceRepo.save).toHaveBeenCalled();
      });
      
      it('should mark agent as late for late clock-in', async () => {
        const agentId = 'agent123';
        const currentTime = new Date(Date.UTC(2024, 9, 13, 10, 5, 0));
      
        // Ensure workingStartTime and workingEndTime are defined
        usersService.findOne.mockResolvedValue({
          id: agentId,
          workingStartTime: new Date(Date.UTC(2024, 9, 13, 9, 0, 0)),
          workingEndTime: new Date(Date.UTC(2024, 9, 13, 17, 0, 0)),
        } as UserEntity);
      
        attendanceRepo.findOne.mockResolvedValue(null); // No existing clock-in
      
        jest.spyOn(service, 'getCurrentTimeInPKT').mockReturnValue(currentTime);
      
        await service.clockIn(agentId);
      
        expect(attendanceRepo.create).toHaveBeenCalledWith({
          agent: { id: agentId },
          date: expect.any(Date),
          clockIn: currentTime,
          isLate: true, // Late flag should be true
          status: AttendanceStatusEnum.CLOCKED_IN,
        });
        expect(attendanceRepo.save).toHaveBeenCalled();
      });
  
      it('should not allow duplicate clock-in for the same day', async () => {
        const agentId = 'agent123';
        const workingStartTime = new Date(Date.UTC(2024, 9, 13, 9, 0, 0)); // Mock start time
        const currentTime = new Date(Date.UTC(2024, 9, 13, 9, 5, 0)); // Mock current time
        
        usersService.findOne.mockResolvedValue({
            id: agentId,
            workingStartTime, // Define workingStartTime in the mock
            workingEndTime: new Date(Date.UTC(2024, 9, 13, 17, 0, 0)),
        } as UserEntity);
        
        attendanceRepo.findOne.mockResolvedValue({ id: 'attendance123' } as AttendanceEntity); // Already clocked in
        
        await expect(service.clockIn(agentId)).rejects.toThrow('You have already clocked in for this workday.');
    });
})


  describe('clockOut', () => {
    let service: AttendanceService;
    let attendanceRepo: jest.Mocked<Repository<AttendanceEntity>>;
    let usersService: jest.Mocked<UsersService>;
  
    beforeEach(() => {
      attendanceRepo = {
        findOne: jest.fn(),
        save: jest.fn(),
      } as any;
  
      usersService = {
        findOne: jest.fn(),
      } as any;
  
      service = new AttendanceService(attendanceRepo, usersService, null);
    });
  
    it('should allow valid clock-out', async () => {
        const agentId = 'agent123';
        const currentTime = new Date(Date.UTC(2024, 9, 13, 17, 0, 0)); // Clock-out time
    
        // Mocking the user
        usersService.findOne.mockResolvedValue({
            id: agentId,
            workingStartTime: new Date(Date.UTC(2024, 9, 13, 9, 0, 0)), // 9 AM start time
            workingEndTime: new Date(Date.UTC(2024, 9, 13, 17, 0, 0)),  // 5 PM end time
        } as UserEntity);
    
        // Mocking the attendanceRepo to return a valid clock-in
        attendanceRepo.findOne.mockResolvedValue({
            id: 'attendance123',
            clockIn: new Date(Date.UTC(2024, 9, 13, 9, 5, 0)), // Valid clock-in time
        } as AttendanceEntity);
    
        // Mocking the current time in PKT timezone
        jest.spyOn(service, 'getCurrentTimeInPKT').mockReturnValue(currentTime);
    
        // Call the clockOut function
        const result = await service.clockOut(agentId);
    
        // Debugging output to see what's inside result
        console.log(result);
    
        // Assertion to check if the clockOut field is correctly set
        expect(result.clockOut).toEqual(currentTime); // Ensure clockOut is set to current time
        expect(result.status).toEqual(AttendanceStatusEnum.CLOCKED_OUT);
    
        // Check if the attendanceRepo.save was called
        expect(attendanceRepo.save).toHaveBeenCalledWith(result);
    });
  
      it('should throw error if no active clock-in is found', async () => {
        const agentId = 'agent123';
      
        usersService.findOne.mockResolvedValue({
          id: agentId,
          workingStartTime: new Date(Date.UTC(2024, 9, 13, 9, 0, 0)),
          workingEndTime: new Date(Date.UTC(2024, 9, 13, 17, 0, 0)),
        } as UserEntity);
      
        attendanceRepo.findOne.mockResolvedValue(null); // No clock-in
      
        await expect(service.clockOut(agentId)).rejects.toThrow('No attendance record found for this workday');
      });
  });