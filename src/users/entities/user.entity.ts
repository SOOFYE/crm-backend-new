import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/roles.enum';
import { LeadEntity } from '../../leads/entities/lead.entity';
import { AttendanceEntity } from '../../attendance/entities/attendance.entity';



@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the user (UUID)' })
  id: string; // Change the type to string for UUID

  @Column()
  @ApiProperty({ description: 'The first name of the user' })
  firstname: string;

  @Column()
  @ApiProperty({ description: 'The last name of the user' })
  lastname: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @Column()
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @Column()
  @ApiProperty({ description: 'The phone number of the user' })
  phoneNumber: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  lastpassword: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AGENT,
  })
  @ApiProperty({ description: 'The role of the user' })
  role: UserRole;

  @OneToMany (()=>LeadEntity, (lead)=> lead.agent)
  leads: LeadEntity

  
  @Column({ type: 'timestamptz', nullable: true }) // Or 'timestamp with time zone'
  @ApiProperty({ description: 'Working start time for the user, with timezone' })
  workingStartTime: Date;  // Use Date to store time with timezone

  @Column({ type: 'timestamptz', nullable: true }) // Or 'timestamp with time zone'
  @ApiProperty({ description: 'Working end time for the user, with timezone' })
  workingEndTime: Date;  // Use Date to store time with timezone

  @Column({nullable: true})
  allowedBreakTimePerDay: string; // e.g., 60 minutes

  @OneToMany(() => AttendanceEntity, attendance => attendance.agent)
  attendances: AttendanceEntity[];


    // New Nullable Fields
    @Column({ nullable: true })
    @ApiProperty({ description: 'The CNIC of the user' })
    cnic: string;  // e.g., Pakistani CNIC number

    @Column({ nullable: true })
    @ApiProperty({ description: 'The CNIC of the user' })
    cnic_photo: string;  // e.g., Pakistani CNIC number
  
    @Column({ nullable: true })
    @ApiProperty({ description: 'The bank account number of the user' })
    bank_account: string;
  
    @Column({ nullable: true })
    @ApiProperty({ description: 'The residential address of the user' })
    address: string;
  
    @Column({ nullable: true })
    @ApiProperty({ description: 'The emergency contact number of the user' })
    emergency_no: string;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
      if (this.password !== this.lastpassword) {
        this.password = await bcrypt.hash(this.password, 10);
      } else {
        throw new Error('New password must not be the same as the last password');
      }
    }
}


