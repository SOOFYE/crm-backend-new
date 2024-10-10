import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { CampaignEntity } from "../../campaigns/entities/campaign.entity";
import { CampaignTypeEntity } from "../../campaign-types/entities/campaign-type.entity";
import { LeadEntity } from "../../leads/entities/lead.entity";

@Entity('forms')
export class FormEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; 

    @Column('jsonb')
    fields: any; 

    @Column('jsonb')
    productsAndPrices : any; 

    @ManyToOne(() => CampaignTypeEntity, campaignType => campaignType.campaigns)
    campaignType: CampaignTypeEntity;  

    @OneToMany(() => CampaignEntity, campaign => campaign.form)
    campaigns: CampaignEntity[]; 

    @OneToMany (()=>LeadEntity, (lead)=> lead.form)
    leads: LeadEntity
    
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
