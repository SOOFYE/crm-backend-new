import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne } from 'typeorm';
import { CallLogEntity } from '../../call-logs/entities/call-log.entity';
import { CampaignEntity } from '../../campaigns/entities/campaign.entity';
import { UserEntity } from '../../users/entities/user.entity';


@Entity('agents')
export class AgentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, user => user.agent)
  user: UserEntity;

  @ManyToOne(() => CampaignEntity, campaign => campaign.agents, { nullable: true })
  currentCampaign: CampaignEntity;

  @OneToMany(() => CallLogEntity, callLog => callLog.agent)
  callLogs: CallLogEntity[];


  @Column()
  assignedPhoneNumber: string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}