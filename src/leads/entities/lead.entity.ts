import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CampaignDataEntity } from "../../campaign-data/entities/campaign-datum.entity";
import { CampaignEntity } from "../../campaigns/entities/campaign.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { LeadStatusEnum } from "../../common/enums/lead-status.enum";
import { FormEntity } from "../../forms/entities/form.entity";

@Entity('leads')
export class LeadEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 15 }) // Adjust length if needed
  phoneNumber: string;

  @ManyToOne(() => CampaignEntity, (campaign) => campaign.leads)
  campaign: CampaignEntity;

  @ManyToOne(() => FormEntity, (form) => form.leads)
  form: FormEntity;

  @ManyToOne(() => UserEntity, (agent) => agent.leads)
  agent: UserEntity;

  @ManyToOne(() => CampaignDataEntity, { nullable: true })
  processedData: CampaignDataEntity;

  @Column('jsonb')
  formData: any;  // Store only form fields data

  @Column('jsonb', { nullable: true })
  selectedProducts: string[];  // Store selected products separately

  @Column({ type: 'enum', enum: LeadStatusEnum, default: LeadStatusEnum.PENDING })
  status: LeadStatusEnum;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenue: number;  // Store revenue based on selected products

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}