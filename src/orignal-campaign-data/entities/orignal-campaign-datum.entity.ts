import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { CampaignDataEntity } from "../../campaign-data/entities/campaign-datum.entity";
import { CampaignTypeEntity } from "../../campaign-types/entities/campaign-type.entity";
import { FilteringModeEnum } from "../../common/enums/filtering-mode.enum";





@Entity('original_campaign_data')
export class OriginalCampaignData {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string; 
  
    @Column({ type: 'varchar', length: 255 })
    s3Url: string; 

    @Column('simple-array')
    duplicateFieldCheck: string[];
    
    @Column('jsonb', {nullable: true})
    filterCriteria?: Record<string, string[]>; 
    
    @Column({ type: 'enum', enum: FilteringModeEnum, default: FilteringModeEnum.INCLUDE })
    FilteringMode: FilteringModeEnum;
  
    @ManyToOne(() => CampaignTypeEntity, campaignType => campaignType.originalData)
    campaignType: CampaignTypeEntity; 

    @OneToOne(() => CampaignDataEntity, data => data.originalData, { nullable: true, cascade:true  })
    @JoinColumn()  
    preprocessedData: CampaignDataEntity; 

    @CreateDateColumn()
    createdAt: Date; 
  
    @UpdateDateColumn()
    updatedAt: Date; 
  
    @DeleteDateColumn()
    deletedAt: Date; 
  

}
