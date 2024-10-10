import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToOne, JoinColumn, ManyToOne, CreateDateColumn, DeleteDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { CampaignDataEntity } from "../../campaign-data/entities/campaign-datum.entity";
import { CampaignTypeEntity } from "../../campaign-types/entities/campaign-type.entity";
import { CampaignStatusEnum } from "../../common/enums/campaign-stats.enum";
import { UserEntity } from "../../users/entities/user.entity";
import { FormEntity } from "../../forms/entities/form.entity";
import { LeadEntity } from "../../leads/entities/lead.entity";

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

  @OneToMany(() => CampaignDataEntity, data => data.campaign, { nullable: true, cascade: true })
  processedData: CampaignDataEntity[];

  @ManyToOne(() => CampaignTypeEntity, campaignType => campaignType.campaigns)
  campaignType: CampaignTypeEntity;

  @ManyToOne(() => FormEntity, form => form.campaigns, { nullable: true, cascade: true })
  form: FormEntity; // A campaign can have only one form

  @OneToMany (()=>LeadEntity, (lead)=> lead.campaign)
  leads: LeadEntity

  @CreateDateColumn()
  createdAt: Date; 

  @UpdateDateColumn()
  updatedAt: Date; 
  
  @DeleteDateColumn()
  deletedAt: Date; 

}