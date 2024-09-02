import { MigrationInterface, QueryRunner } from "typeorm";

export class Campaigntables1725055485654 implements MigrationInterface {
    name = 'Campaigntables1725055485654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "startDate" date NOT NULL, "endDate" date NOT NULL, "typeId" uuid, CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."campaign_data_status_enum" AS ENUM('pending', 'failed', 'success')`);
        await queryRunner.query(`CREATE TABLE "campaign_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "s3Url" character varying(255) NOT NULL, "status" "public"."campaign_data_status_enum" NOT NULL DEFAULT 'pending', "data" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "campaignTypeId" uuid, CONSTRAINT "PK_202a28f9808768e8f1d9b8ac03e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "original_campaign_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "s3Url" character varying(255) NOT NULL, "duplicateFieldCheck" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "campaignTypeId" uuid, "preprocessedDataId" uuid, CONSTRAINT "PK_78ce4e6faf0e27d995fa10b8f92" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campaign_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_681677e8838f686df37b6046dc5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campaigns_agents_users" ("campaignsId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_244d39042c85c4297871e16c4d6" PRIMARY KEY ("campaignsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4e7d120d8e84b45b2f078885aa" ON "campaigns_agents_users" ("campaignsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cd8cf26b530b75867e8f197be6" ON "campaigns_agents_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_9f92ebef9b19d9fd359a448951c" FOREIGN KEY ("typeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "FK_07ef48b40c8f3bb5a058527cf3c" FOREIGN KEY ("campaignTypeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "FK_ed3280aa178b381134197e71131" FOREIGN KEY ("campaignTypeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "FK_1c8d6337f8fd6a716334eec04d9" FOREIGN KEY ("preprocessedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaigns_agents_users" ADD CONSTRAINT "FK_4e7d120d8e84b45b2f078885aaa" FOREIGN KEY ("campaignsId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "campaigns_agents_users" ADD CONSTRAINT "FK_cd8cf26b530b75867e8f197be6c" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns_agents_users" DROP CONSTRAINT "FK_cd8cf26b530b75867e8f197be6c"`);
        await queryRunner.query(`ALTER TABLE "campaigns_agents_users" DROP CONSTRAINT "FK_4e7d120d8e84b45b2f078885aaa"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "FK_1c8d6337f8fd6a716334eec04d9"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "FK_ed3280aa178b381134197e71131"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "FK_07ef48b40c8f3bb5a058527cf3c"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_9f92ebef9b19d9fd359a448951c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cd8cf26b530b75867e8f197be6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e7d120d8e84b45b2f078885aa"`);
        await queryRunner.query(`DROP TABLE "campaigns_agents_users"`);
        await queryRunner.query(`DROP TABLE "campaign_types"`);
        await queryRunner.query(`DROP TABLE "original_campaign_data"`);
        await queryRunner.query(`DROP TABLE "campaign_data"`);
        await queryRunner.query(`DROP TYPE "public"."campaign_data_status_enum"`);
        await queryRunner.query(`DROP TABLE "campaigns"`);
    }

}
