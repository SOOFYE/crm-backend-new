import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/roles.enum';
import { LeadEntity } from '../../leads/entities/lead.entity';





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


