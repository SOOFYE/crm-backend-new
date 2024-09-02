import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaignentityNull1725062889319 implements MigrationInterface {
    name = 'CampaignentityNull1725062889319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_data" ALTER COLUMN "s3Url" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_data" ALTER COLUMN "s3Url" SET NOT NULL`);
    }

}
