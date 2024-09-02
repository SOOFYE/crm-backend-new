import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaigDataEntity1725228389042 implements MigrationInterface {
    name = 'CampaigDataEntity1725228389042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD "duplicateStatsS3Url" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD "replicatedStatsS3Url" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP COLUMN "replicatedStatsS3Url"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP COLUMN "duplicateStatsS3Url"`);
    }

}
