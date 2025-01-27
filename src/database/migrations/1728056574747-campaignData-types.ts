import { MigrationInterface, QueryRunner } from "typeorm";

export class CampaignDataTypes1728056574747 implements MigrationInterface {
    name = 'CampaignDataTypes1728056574747'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_34f7543fd7c4471ab396427e75a"`);
        await queryRunner.query(`
            CREATE TABLE "forms" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "fields" jsonb NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "campaignTypeId" uuid,
                CONSTRAINT "PK_ba062fd30b06814a60756f233da" PRIMARY KEY ("id")
            )
        `);

        // Check if the "original_campaign_data_filteringmode_enum" type exists before creating it
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'original_campaign_data_filteringmode_enum') THEN
                    CREATE TYPE "public"."original_campaign_data_filteringmode_enum" AS ENUM('include', 'exclude');
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`
            ALTER TABLE "original_campaign_data"
            ADD "FilteringMode" "public"."original_campaign_data_filteringmode_enum" NOT NULL DEFAULT 'include';
        `);

        // Add other columns and constraints as required
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD "filterCriteria" jsonb`);
        await queryRunner.query(`ALTER TABLE "campaign_types" ADD "requiredFields" text`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "formId" uuid`);
        await queryRunner.query(`
            ALTER TABLE "campaigns"
            ADD CONSTRAINT "FK_4938915d9a8b6d92ea91856b73e"
            FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);

        await queryRunner.query(`
            ALTER TABLE "forms"
            ADD CONSTRAINT "FK_0530e08cf1271a2ed11bbe75a9d"
            FOREIGN KEY ("campaignTypeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "forms" DROP CONSTRAINT "FK_0530e08cf1271a2ed11bbe75a9d"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_4938915d9a8b6d92ea91856b73e"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "formId"`);
        await queryRunner.query(`ALTER TABLE "campaign_types" DROP COLUMN "requiredFields"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP COLUMN "FilteringMode"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP COLUMN "filterCriteria"`);

        // Drop the enum type only if it exists
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'original_campaign_data_filteringmode_enum') THEN
                    DROP TYPE "public"."original_campaign_data_filteringmode_enum";
                END IF;
            END
            $$;
        `);

        await queryRunner.query(`DROP TABLE "forms"`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_34f7543fd7c4471ab396427e75a" FOREIGN KEY ("processedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}