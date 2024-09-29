import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, CreateDateColumn, DeleteDateColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/roles.enum';
import { AgentEntity } from '../../agents/entities/agent.entity';


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the user (UUID)' })
  id: string;

  @Column()
  @ApiProperty({ description: 'The first name of the user' })
  firstname: string;

  @Column()
  @ApiProperty({ description: 'The last name of the user' })
  lastname: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'The username of the user' })
  username: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @Column()
  @ApiProperty({ description: 'The phone number of the user' })
  phoneNumber: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The CNIC number of the user' })
  cnic?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The bank name of the user', required: false })
  bankName?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The bank account number of the user', required: false })
  bankAccount?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The address of the user', required: false })
  address?: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The emergency phone number of the user', required: false })
  emergencyPhoneNumber?: string;

  @Column()
  @ApiProperty({ description: 'The password of the user' })
  password: string;

  @Column({ nullable: true })
  @ApiProperty({ description: 'The last password of the user' })
  lastpassword: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AGENT,
  })
  @ApiProperty({ description: 'The role of the user' })
  role: UserRole;

  @OneToOne(() => AgentEntity, agent => agent.user)
  @JoinColumn() 
  agent: AgentEntity;

  @CreateDateColumn()
  @ApiProperty({ description: 'The date the user was created' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'The date the user was last updated' })
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  @ApiProperty({ description: 'The date the user was deleted (soft delete)' })
  deletedAt?: Date;

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

