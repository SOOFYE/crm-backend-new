import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEntity1729197084844 implements MigrationInterface {
    name = 'UserEntity1729197084844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "cnic" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "cnic_photo" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "bank_account" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "emergency_no" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "emergency_no"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bank_account"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cnic_photo"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "cnic"`);
    }

}
