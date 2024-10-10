
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';
import { OriginalCampaignData } from '../../orignal-campaign-data/entities/orignal-campaign-datum.entity';
import { CampaignDataEntity } from '../../campaign-data/entities/campaign-datum.entity';
import { CampaignEntity } from '../../campaigns/entities/campaign.entity';
import { FormEntity } from '../../forms/entities/form.entity';


@Entity('campaign_types')
export class CampaignTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('simple-array', { nullable: true })
  requiredFields: string[];

  @OneToMany(() => CampaignEntity, campaign => campaign.campaignType)
  campaigns: CampaignEntity[];

  @OneToMany(() => OriginalCampaignData, campaign => campaign.campaignType)
  originalData: OriginalCampaignData[];

  @OneToMany(() => CampaignDataEntity, campaign => campaign.campaignType)
  preprocessedData: CampaignDataEntity[];

  @OneToMany(() => FormEntity, form => form.campaignType)
  forms: FormEntity[];

  @CreateDateColumn()
  createdAt: Date; 

  @UpdateDateColumn()
  updatedAt: Date; 

  @DeleteDateColumn()
  deletedAt: Date; 

}