import { MigrationInterface, QueryRunner } from "typeorm";

export class Campaignentityfix21725117870127 implements MigrationInterface {
    name = 'Campaignentityfix21725117870127'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD "preprocessedDataId" uuid`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "UQ_1c8d6337f8fd6a716334eec04d9" UNIQUE ("preprocessedDataId")`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD "campaignId" uuid`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "UQ_59ff34c7b07425c93395d044bda" UNIQUE ("campaignId")`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD "campaignId" uuid`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "UQ_90f4b9bfa0b447f9e15337e3b6d" UNIQUE ("campaignId")`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "originalDataId" uuid`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "UQ_c693f4f106ab47c2bd21e01f636" UNIQUE ("originalDataId")`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "processedDataId" uuid`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "UQ_34f7543fd7c4471ab396427e75a" UNIQUE ("processedDataId")`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "FK_1c8d6337f8fd6a716334eec04d9" FOREIGN KEY ("preprocessedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "FK_59ff34c7b07425c93395d044bda" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "FK_90f4b9bfa0b447f9e15337e3b6d" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_c693f4f106ab47c2bd21e01f636" FOREIGN KEY ("originalDataId") REFERENCES "original_campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_34f7543fd7c4471ab396427e75a" FOREIGN KEY ("processedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_34f7543fd7c4471ab396427e75a"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_c693f4f106ab47c2bd21e01f636"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "FK_90f4b9bfa0b447f9e15337e3b6d"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "FK_59ff34c7b07425c93395d044bda"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "FK_1c8d6337f8fd6a716334eec04d9"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "UQ_34f7543fd7c4471ab396427e75a"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "processedDataId"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "UQ_c693f4f106ab47c2bd21e01f636"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "originalDataId"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "UQ_90f4b9bfa0b447f9e15337e3b6d"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP COLUMN "campaignId"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "UQ_59ff34c7b07425c93395d044bda"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP COLUMN "campaignId"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "UQ_1c8d6337f8fd6a716334eec04d9"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP COLUMN "preprocessedDataId"`);
    }

}
