import { MigrationInterface, QueryRunner } from "typeorm";

export class Leads1729017186245 implements MigrationInterface {
    name = 'Leads1729017186245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."leads_status_enum" RENAME TO "leads_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."leads_status_enum" AS ENUM('pending', 'active', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "leads" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "leads" ALTER COLUMN "status" TYPE "public"."leads_status_enum" USING "status"::"text"::"public"."leads_status_enum"`);
        await queryRunner.query(`ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."leads_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."leads_status_enum_old" AS ENUM('pending', 'good lead', 'bad lead', 'matured', 'cash back')`);
        await queryRunner.query(`ALTER TABLE "leads" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "leads" ALTER COLUMN "status" TYPE "public"."leads_status_enum_old" USING "status"::"text"::"public"."leads_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."leads_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."leads_status_enum_old" RENAME TO "leads_status_enum"`);
    }

}
