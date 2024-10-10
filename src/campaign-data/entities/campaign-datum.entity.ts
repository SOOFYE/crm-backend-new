

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { CampaignTypeEntity } from '../../campaign-types/entities/campaign-type.entity';
import { CampaignEntity } from '../../campaigns/entities/campaign.entity';
import { CampaignDataEnum } from '../../common/enums/campaign-dataum.enum';
import { OriginalCampaignData } from '../../orignal-campaign-data/entities/orignal-campaign-datum.entity';
import { Exclude } from 'class-transformer';


@Entity('campaign_data')
export class CampaignDataEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string; 
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    s3Url?: string; 
  
    @Column({ type: 'enum', enum: CampaignDataEnum, default: CampaignDataEnum.PENDING })
    status: CampaignDataEnum; 

    @ManyToOne(() => CampaignTypeEntity, campaignType => campaignType.preprocessedData)
    campaignType: CampaignTypeEntity; 

    @ManyToOne(() => CampaignEntity, campaign => campaign.processedData, { nullable: true })
    campaign: CampaignEntity;

    @Column({ type: 'jsonb', nullable: true })
    @Exclude()
    data: any; 

    @OneToOne(() => OriginalCampaignData, originalData => originalData.preprocessedData)
    @JoinColumn()
    originalData: OriginalCampaignData; 

    @Column({ type: 'varchar', length: 255, nullable: true })
    duplicateStatsS3Url: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    replicatedStatsS3Url: string
  
    @CreateDateColumn()
    createdAt: Date; 
  
    @UpdateDateColumn()
    updatedAt: Date; 
  
    @DeleteDateColumn()
    deletedAt: Date; 
  

}