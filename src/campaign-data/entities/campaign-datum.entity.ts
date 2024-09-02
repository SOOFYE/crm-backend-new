

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { CampaignType } from '../../campaign-types/entities/campaign-type.entity';
import { CampaignEntity } from '../../campaigns/entities/campaign.entity';
import { CampaignDataEnum } from '../../common/enums/campaign-dataum.enum';
import { OriginalCampaignData } from '../../orignal-campaign-data/entities/orignal-campaign-datum.entity';


@Entity('campaign_data')
export class CampaignData {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string; // Name or identifier for the preprocessed data
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    s3Url?: string; // S3 URL to access the processed data file
  
    @Column({ type: 'enum', enum: CampaignDataEnum, default: CampaignDataEnum.PENDING })
    status: CampaignDataEnum; // Status of the processing: pending, success, failed

    @ManyToOne(() => CampaignType, campaignType => campaignType.preprocessedData)
    campaignType: CampaignType; // Link to the campaign type

    @OneToOne(() => CampaignEntity, campaign => campaign.processedData, { nullable: true })
    @JoinColumn()
    campaign: CampaignEntity; // Relation to the campaign that was processed

    @Column({ type: 'jsonb', nullable: true })
    data: any; // Store preprocessed data as a JSON object

    @OneToOne(() => OriginalCampaignData, originalData => originalData.preprocessedData)
    @JoinColumn()
    originalData: OriginalCampaignData; // Relation to original campaign data that was processed

    @Column({ type: 'varchar', length: 255, nullable: true })
    duplicateStatsS3Url: string

    @Column({ type: 'varchar', length: 255, nullable: true })
    replicatedStatsS3Url: string
  
    @CreateDateColumn()
    createdAt: Date; // Timestamp for when the record was created
  
    @UpdateDateColumn()
    updatedAt: Date; // Timestamp for when the record was last updated
  
    @DeleteDateColumn()
    deletedAt: Date; // Timestamp for soft delete
  

}