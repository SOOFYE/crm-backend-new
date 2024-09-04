import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaignEntity1725393427005 implements MigrationInterface {
    name = 'CampaignEntity1725393427005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_9f92ebef9b19d9fd359a448951c"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "typeId"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "goodZipCodes"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "filterField" text`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "filterCriteria" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "filteredData" jsonb`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "campaignTypeId" uuid`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_c2700eec828fa96646473c54c2b" FOREIGN KEY ("campaignTypeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_c2700eec828fa96646473c54c2b"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "campaignTypeId"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "filteredData"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "filterCriteria"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "filterField"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "goodZipCodes" text`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "typeId" uuid`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_9f92ebef9b19d9fd359a448951c" FOREIGN KEY ("typeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
