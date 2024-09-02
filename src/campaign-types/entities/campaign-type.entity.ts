
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { OriginalCampaignData } from '../../orignal-campaign-data/entities/orignal-campaign-datum.entity';
import { CampaignData } from '../../campaign-data/entities/campaign-datum.entity';
import { CampaignEntity } from '../../campaigns/entities/campaign.entity';


@Entity('campaign_types')
export class CampaignType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => CampaignEntity, campaign => campaign.type)
  campaigns: CampaignEntity[];

  @OneToMany(() => OriginalCampaignData, campaign => campaign.campaignType)
  originalData: OriginalCampaignData[];

  @OneToMany(() => CampaignData, campaign => campaign.campaignType)
  preprocessedData: CampaignData[];

  @CreateDateColumn()
  createdAt: Date; // Timestamp for when the record was created

  @UpdateDateColumn()
  updatedAt: Date; // Timestamp for when the record was last updated

  @DeleteDateColumn()
  deletedAt: Date; // Timestamp for soft delete

}