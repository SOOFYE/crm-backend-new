import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { CampaignEntity } from '../../campaigns/entities/campaign.entity';
import { CampaignData } from '../../campaign-data/entities/campaign-datum.entity';

@Entity('rescheduled_calls')
export class RescheduledCallEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CampaignEntity, campaign => campaign.id, { nullable: false })
  campaign: CampaignEntity;

  @ManyToOne(() => CampaignData, campaignData => campaignData.id, { nullable: false })
  preprocessedData: CampaignData;

  @Column({ type: 'varchar', length: 255 })
  recordId: string; // ID of the data record

  @Column({ type: 'timestamp' })
  scheduledDate: Date; // The date and time for the rescheduled call

  @CreateDateColumn()
  createdAt: Date;
}
