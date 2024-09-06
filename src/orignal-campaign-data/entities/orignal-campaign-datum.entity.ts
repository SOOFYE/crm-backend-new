
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, DeleteDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { CampaignData } from '../../campaign-data/entities/campaign-datum.entity';
import { CampaignType } from '../../campaign-types/entities/campaign-type.entity';



@Entity('original_campaign_data')
export class OriginalCampaignData {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string; // The original file name
  
    @Column({ type: 'varchar', length: 255 })
    s3Url: string; // S3 URL to access the original file

    @Column('simple-array')
    duplicateFieldCheck: string[]; // Fields to check for duplicates within the file
  
    @ManyToOne(() => CampaignType, campaignType => campaignType.originalData)
    campaignType: CampaignType; // Link to the campaign type

    @OneToOne(() => CampaignData, data => data.originalData, { nullable: true, cascade:true  })
    @JoinColumn()  // This decorator tells TypeORM which column to use for the foreign key
    preprocessedData: CampaignData; // Relation to the preprocessed data, will be linked once processing is complete

    @CreateDateColumn()
    createdAt: Date; // Timestamp for when the record was created
  
    @UpdateDateColumn()
    updatedAt: Date; // Timestamp for when the record was last updated
  
    @DeleteDateColumn()
    deletedAt: Date; // Timestamp for soft delete
  

}
