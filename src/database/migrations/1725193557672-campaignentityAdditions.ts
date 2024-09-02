import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaignentityAdditions1725193557672 implements MigrationInterface {
    name = 'CampaignentityAdditions1725193557672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "FK_59ff34c7b07425c93395d044bda"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_c693f4f106ab47c2bd21e01f636"`);
        await queryRunner.query(`CREATE TABLE "rescheduled_calls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recordId" character varying(255) NOT NULL, "scheduledDate" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "campaignId" uuid NOT NULL, "preprocessedDataId" uuid NOT NULL, CONSTRAINT "PK_5df447c99d46513a8e4883f7b70" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "UQ_59ff34c7b07425c93395d044bda"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP COLUMN "campaignId"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "UQ_c693f4f106ab47c2bd21e01f636"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "originalDataId"`);
        await queryRunner.query(`CREATE TYPE "public"."campaigns_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "status" "public"."campaigns_status_enum" NOT NULL DEFAULT 'inactive'`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "goodZipCodes" text`);
        await queryRunner.query(`ALTER TABLE "rescheduled_calls" ADD CONSTRAINT "FK_ce45e3b97463998045dd5e23bff" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rescheduled_calls" ADD CONSTRAINT "FK_9fad1a84805d122a3ef33e944b1" FOREIGN KEY ("preprocessedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rescheduled_calls" DROP CONSTRAINT "FK_9fad1a84805d122a3ef33e944b1"`);
        await queryRunner.query(`ALTER TABLE "rescheduled_calls" DROP CONSTRAINT "FK_ce45e3b97463998045dd5e23bff"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "goodZipCodes"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."campaigns_status_enum"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "originalDataId" uuid`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "UQ_c693f4f106ab47c2bd21e01f636" UNIQUE ("originalDataId")`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "endDate" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "startDate" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD "campaignId" uuid`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "UQ_59ff34c7b07425c93395d044bda" UNIQUE ("campaignId")`);
        await queryRunner.query(`DROP TABLE "rescheduled_calls"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_c693f4f106ab47c2bd21e01f636" FOREIGN KEY ("originalDataId") REFERENCES "original_campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "FK_59ff34c7b07425c93395d044bda" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
