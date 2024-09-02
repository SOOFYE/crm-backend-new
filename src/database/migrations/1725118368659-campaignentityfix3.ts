import { MigrationInterface, QueryRunner } from "typeorm";

export class Campaignentityfix31725118368659 implements MigrationInterface {
    name = 'Campaignentityfix31725118368659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD "originalDataId" uuid`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "UQ_89fa7e3ec5964d2925752b44b07" UNIQUE ("originalDataId")`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "FK_89fa7e3ec5964d2925752b44b07" FOREIGN KEY ("originalDataId") REFERENCES "original_campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "FK_89fa7e3ec5964d2925752b44b07"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "UQ_89fa7e3ec5964d2925752b44b07"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP COLUMN "originalDataId"`);
    }

}
