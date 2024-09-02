import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { CampaignData } from "../../campaign-data/entities/campaign-datum.entity";
import { CampaignType } from "../../campaign-types/entities/campaign-type.entity";
import { CampaignStatusEnum } from "../../common/enums/campaign-stats.enum";
import { UserEntity } from "../../users/entities/user.entity";

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

  @ManyToMany(() => UserEntity)
  @JoinTable()
  agents: UserEntity[];

  @OneToOne(() => CampaignData, data => data.campaign, { nullable: true })
  @JoinColumn()
  processedData: CampaignData;

  @ManyToOne(() => CampaignType, campaignType => campaignType.campaigns)
  type: CampaignType;

  @Column('simple-array', { nullable: true })
  goodZipCodes: string[];  // Array to store good zip codes
}