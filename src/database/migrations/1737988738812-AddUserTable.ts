import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTable1737988738812 implements MigrationInterface {
    name = 'AddUserTable1737988738812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "original_campaign_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "s3Url" character varying(255) NOT NULL, "duplicateFieldCheck" text NOT NULL, "filterCriteria" jsonb, "FilteringMode" "public"."original_campaign_data_filteringmode_enum" NOT NULL DEFAULT 'include', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "campaignTypeId" uuid, "preprocessedDataId" uuid, CONSTRAINT "REL_1c8d6337f8fd6a716334eec04d" UNIQUE ("preprocessedDataId"), CONSTRAINT "PK_78ce4e6faf0e27d995fa10b8f92" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "forms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "fields" jsonb NOT NULL, "productsAndPrices" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "campaignTypeId" uuid, CONSTRAINT "PK_ba062fd30b06814a60756f233da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "status" "public"."campaigns_status_enum" NOT NULL DEFAULT 'inactive', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "campaignTypeId" uuid, "formId" uuid, CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campaign_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "requiredFields" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_681677e8838f686df37b6046dc5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campaign_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "s3Url" character varying(255), "status" "public"."campaign_data_status_enum" NOT NULL DEFAULT 'pending', "data" jsonb, "duplicateStatsS3Url" character varying(255), "replicatedStatsS3Url" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "campaignTypeId" uuid, "campaignId" uuid, "originalDataId" uuid, CONSTRAINT "REL_89fa7e3ec5964d2925752b44b0" UNIQUE ("originalDataId"), CONSTRAINT "PK_202a28f9808768e8f1d9b8ac03e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "leads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "phoneNumber" character varying(15) NOT NULL, "formData" jsonb NOT NULL, "selectedProducts" jsonb, "status" "public"."leads_status_enum" NOT NULL DEFAULT 'pending', "revenue" numeric(10,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "campaignId" uuid, "formId" uuid, "agentId" uuid, "processedDataId" uuid, CONSTRAINT "PK_cd102ed7a9a4ca7d4d8bfeba406" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "clockIn" TIMESTAMP WITH TIME ZONE, "clockOut" TIMESTAMP WITH TIME ZONE, "absenteeStatus" character varying NOT NULL DEFAULT 'present', "clockInStatus" character varying DEFAULT 'clocked-in-early', "clockOutStatus" character varying DEFAULT 'clocked-in-early', "hoursWorked" integer, "agentId" uuid, CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying NOT NULL, "password" character varying NOT NULL, "lastpassword" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'agent', "workingStartTime" TIMESTAMP WITH TIME ZONE, "workingEndTime" TIMESTAMP WITH TIME ZONE, "allowedBreakTimePerDay" character varying, "cnic" character varying, "cnic_photo" character varying, "bank_account" character varying, "address" character varying, "emergency_no" character varying, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "holidays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "holidayDate" date NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_3646bdd4c3817d954d830881dfe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "campaigns_agents_users" ("campaignsId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_244d39042c85c4297871e16c4d6" PRIMARY KEY ("campaignsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4e7d120d8e84b45b2f078885aa" ON "campaigns_agents_users" ("campaignsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_cd8cf26b530b75867e8f197be6" ON "campaigns_agents_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "FK_ed3280aa178b381134197e71131" FOREIGN KEY ("campaignTypeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" ADD CONSTRAINT "FK_1c8d6337f8fd6a716334eec04d9" FOREIGN KEY ("preprocessedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "forms" ADD CONSTRAINT "FK_0530e08cf1271a2ed11bbe75a9d" FOREIGN KEY ("campaignTypeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_c2700eec828fa96646473c54c2b" FOREIGN KEY ("campaignTypeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaigns" ADD CONSTRAINT "FK_4938915d9a8b6d92ea91856b73e" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "FK_07ef48b40c8f3bb5a058527cf3c" FOREIGN KEY ("campaignTypeId") REFERENCES "campaign_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "FK_90f4b9bfa0b447f9e15337e3b6d" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaign_data" ADD CONSTRAINT "FK_89fa7e3ec5964d2925752b44b07" FOREIGN KEY ("originalDataId") REFERENCES "original_campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_6873e5924bc699a1a65b4fb099a" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_08e50b251ecb4417800af268b26" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_9f995d5db8cf0d58f5bf6773735" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_93577a3ca08d5250ac6048b6513" FOREIGN KEY ("processedDataId") REFERENCES "campaign_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_4fcd7dd61cf285f0e4b618a634c" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "campaigns_agents_users" ADD CONSTRAINT "FK_4e7d120d8e84b45b2f078885aaa" FOREIGN KEY ("campaignsId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "campaigns_agents_users" ADD CONSTRAINT "FK_cd8cf26b530b75867e8f197be6c" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns_agents_users" DROP CONSTRAINT "FK_cd8cf26b530b75867e8f197be6c"`);
        await queryRunner.query(`ALTER TABLE "campaigns_agents_users" DROP CONSTRAINT "FK_4e7d120d8e84b45b2f078885aaa"`);
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_4fcd7dd61cf285f0e4b618a634c"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_93577a3ca08d5250ac6048b6513"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_9f995d5db8cf0d58f5bf6773735"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_08e50b251ecb4417800af268b26"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_6873e5924bc699a1a65b4fb099a"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "FK_89fa7e3ec5964d2925752b44b07"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "FK_90f4b9bfa0b447f9e15337e3b6d"`);
        await queryRunner.query(`ALTER TABLE "campaign_data" DROP CONSTRAINT "FK_07ef48b40c8f3bb5a058527cf3c"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_4938915d9a8b6d92ea91856b73e"`);
        await queryRunner.query(`ALTER TABLE "campaigns" DROP CONSTRAINT "FK_c2700eec828fa96646473c54c2b"`);
        await queryRunner.query(`ALTER TABLE "forms" DROP CONSTRAINT "FK_0530e08cf1271a2ed11bbe75a9d"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "FK_1c8d6337f8fd6a716334eec04d9"`);
        await queryRunner.query(`ALTER TABLE "original_campaign_data" DROP CONSTRAINT "FK_ed3280aa178b381134197e71131"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cd8cf26b530b75867e8f197be6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4e7d120d8e84b45b2f078885aa"`);
        await queryRunner.query(`DROP TABLE "campaigns_agents_users"`);
        await queryRunner.query(`DROP TABLE "holidays"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "attendance"`);
        await queryRunner.query(`DROP TABLE "leads"`);
        await queryRunner.query(`DROP TABLE "campaign_data"`);
        await queryRunner.query(`DROP TABLE "campaign_types"`);
        await queryRunner.query(`DROP TABLE "campaigns"`);
        await queryRunner.query(`DROP TABLE "forms"`);
        await queryRunner.query(`DROP TABLE "original_campaign_data"`);
    }

}
