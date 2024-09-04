import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaignEntityDates1725446356277 implements MigrationInterface {
    name = 'CampaignEntityDates1725446356277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "createdAt"`);
    }

}
