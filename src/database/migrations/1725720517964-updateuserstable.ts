import { MigrationInterface, QueryRunner } from "typeorm";

export class Updateuserstable1725720517964 implements MigrationInterface {
    name = 'Updateuserstable1725720517964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "cnic" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bankName" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bankAccount" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emergencyPhoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emergencyPhoneNumber"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bankAccount"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bankName"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cnic"`);
    }

}
