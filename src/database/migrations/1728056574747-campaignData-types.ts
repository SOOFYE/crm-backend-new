import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaignDataTypes1728056574747 implements MigrationInterface {
    name = 'CampaignDataTypes1728056574747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_34f7543fd7c4471ab396427e75a"`);
        await queryRunner.query(`CREATE TABLE "forms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "fields" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "campaignTypeId" uuid, CONSTRAINT "PK_ba062fd30b06814a60756f233da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cnic"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bankName"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bankAccount"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emergencyPhoneNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "UQ_34f7543fd7c4471ab396427e75a"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "processedDataId"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "filterField"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "filterCriteria"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "filteredData"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "additionalFields"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD "filterCriteria" jsonb`);
        await queryRunner.query(`CREATE TYPE "public"."original_campaign_data_filteringmode_enum" AS ENUM('include', 'exclude')`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD "FilteringMode" "public"."original_campaign_data_filteringmode_enum" NOT NULL DEFAULT 'include'`);
        await queryRunner.query(`ALTER TABLE "campaign_types" ADD "requiredFields" text`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "formId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "FK_90f4b9bfa0b447f9e15337e3b6d"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "UQ_90f4b9bfa0b447f9e15337e3b6d"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "FK_90f4b9bfa0b447f9e15337e3b6d" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_4938915d9a8b6d92ea91856b73e" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forms" ADD CONSTRAINT "FK_0530e08cf1271a2ed11bbe75a9d" FOREIGN KEY ("campaignTypeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "forms" DROP CONSTRAINT "FK_0530e08cf1271a2ed11bbe75a9d"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_4938915d9a8b6d92ea91856b73e"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "FK_90f4b9bfa0b447f9e15337e3b6d"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "UQ_90f4b9bfa0b447f9e15337e3b6d" UNIQUE ("campaignId")`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "FK_90f4b9bfa0b447f9e15337e3b6d" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "formId"`);
        await queryRunner.query(`ALTER TABLE "campaign_types" DROP COLUMN "requiredFields"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP COLUMN "FilteringMode"`);
        await queryRunner.query(`DROP TYPE "public"."original_campaign_data_filteringmode_enum"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP COLUMN "filterCriteria"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "additionalFields" jsonb`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "filteredData" jsonb`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "filterCriteria" jsonb`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "filterField" text`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "processedDataId" uuid`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "UQ_34f7543fd7c4471ab396427e75a" UNIQUE ("processedDataId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emergencyPhoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bankAccount" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bankName" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "cnic" character varying`);
        await queryRunner.query(`DROP TABLE "forms"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_34f7543fd7c4471ab396427e75a" FOREIGN KEY ("processedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
