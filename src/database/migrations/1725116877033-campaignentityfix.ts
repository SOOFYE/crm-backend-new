import { MigrationInterface, QueryRunner } from "typeorm";

export class Campaignentityfix1725116877033 implements MigrationInterface {
    name = 'Campaignentityfix1725116877033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "FK_1c8d6337f8fd6a716334eec04d9"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP COLUMN "preprocessedDataId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD "preprocessedDataId" uuid`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "FK_1c8d6337f8fd6a716334eec04d9" FOREIGN KEY ("preprocessedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
