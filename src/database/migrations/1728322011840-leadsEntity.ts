import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadsEntity1728322011840 implements MigrationInterface {
    name = 'LeadsEntity1728322011840'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."leads_status_enum" AS ENUM('pending', 'good lead', 'bad lead', 'matured', 'cash back')`);
        await queryRunner.query(`CREATE TABLE "leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "formData" jsonb NOT NULL, "status" "public"."leads_status_enum" NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "campaignId" uuid, "agentId" uuid, "processedDataId" uuid, CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_6873e5924bc699a1a65b4fb099a" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_9f995d5db8cf0d58f5bf6773735" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_93577a3ca08d5250ac6048b6513" FOREIGN KEY ("processedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_93577a3ca08d5250ac6048b6513"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_9f995d5db8cf0d58f5bf6773735"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_6873e5924bc699a1a65b4fb099a"`);
        await queryRunner.query(`DROP TABLE "leads"`);
        await queryRunner.query(`DROP TYPE "public"."leads_status_enum"`);
    }

}
