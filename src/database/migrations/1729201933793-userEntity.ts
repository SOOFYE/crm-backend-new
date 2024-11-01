import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEntity1729201933793 implements MigrationInterface {
    name = 'UserEntity1729201933793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "allowedBreakTimePerDay"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "allowedBreakTimePerDay" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "allowedBreakTimePerDay"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "allowedBreakTimePerDay" integer`);
    }

}
