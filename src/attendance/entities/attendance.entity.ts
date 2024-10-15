import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from "typeorm";
import { UserEntity } from "../../users/entities/user.entity";
import { AttendanceStatusEnum } from "../../common/enums/attendance-status.enum";
import { ApiProperty } from "@nestjs/swagger";
import { AbsenteeStatusEnum } from "../../common/enums/absentee-status.enum";

@Entity('attendance')
export class AttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (agent) => agent.attendances)
  agent: UserEntity;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'timestamptz', nullable: true }) // or 'timestamp with time zone'
  @ApiProperty({ description: 'Clock-in time with timezone' })
  clockIn: Date;  // Use Date type to store time with timezone

  @Column({ type: 'timestamptz', nullable: true }) // or 'timestamp with time zone'
  @ApiProperty({ description: 'Clock-out time with timezone' })
  clockOut: Date;  // Use Date type to store time with timezone

  @Column({ type: 'varchar', enum: AttendanceStatusEnum, default: AbsenteeStatusEnum.PRESENT })
  absenteeStatus: AbsenteeStatusEnum

  @Column({ type: 'varchar', enum: AttendanceStatusEnum, default: AttendanceStatusEnum.CLOCKED_IN_EARLY,nullable: true })
  clockInStatus: AttendanceStatusEnum

  @Column({ type: 'varchar', enum: AttendanceStatusEnum, default: AttendanceStatusEnum.CLOCKED_IN_EARLY,nullable: true })
  clockOutStatus: AttendanceStatusEnum

  @Column({nullable: true})
  hoursWorked: number;

}