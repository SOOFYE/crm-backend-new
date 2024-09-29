import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToOne, JoinColumn, ManyToOne, CreateDateColumn, DeleteDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { CampaignData } from "../../campaign-data/entities/campaign-datum.entity";
import { CampaignType } from "../../campaign-types/entities/campaign-type.entity";
import { CampaignStatusEnum } from "../../common/enums/campaign-stats.enum";
import { UserEntity } from "../../users/entities/user.entity";
import { CallLogEntity } from "../../call-logs/entities/call-log.entity";
import { AgentEntity } from "../../agents/entities/agent.entity";

@Entity('campaigns')
export class CampaignEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CampaignStatusEnum, default: CampaignStatusEnum.INACTIVE })
  status: CampaignStatusEnum;

  @OneToMany(() => AgentEntity, agent => agent.currentCampaign)
  agents: AgentEntity[];

  @OneToOne(() => CampaignData, data => data.campaign, { nullable: true })
  @JoinColumn()
  processedData: CampaignData;

  @ManyToOne(() => CampaignType, campaignType => campaignType.campaigns)
  campaignType: CampaignType;

  @Column('simple-array', { nullable: true })
  filterField: string[];  // Columns from CSV used for filtering (e.g., ['zipcodes', 'states'])

  @Column('jsonb', {nullable: true})
  filterCriteria?: Record<string, string[]>;  // Filter criteria stored as key-value pairs, where the key is the column name, and the value is an array of criteria

  @Column('jsonb', { nullable: true })
  filteredData: any[];  // Filtered data based on the criteria

  @Column('jsonb', { nullable: true })
  additionalFields: { name: string; type: string }[];  // Array of objects representing additional fields (name and type)


  @OneToMany(() => CallLogEntity, callLog => callLog.campaign)
  callLogs: CallLogEntity[];


  @CreateDateColumn()
  createdAt: Date; // Timestamp for when the record was created
  
  @UpdateDateColumn()
  updatedAt: Date; // Timestamp for when the record was last updated
  
  @DeleteDateColumn()
  deletedAt: Date; // Timestamp for soft delete

}