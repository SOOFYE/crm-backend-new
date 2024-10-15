import { MigrationInterface, QueryRunner } from "typeorm";

export class Attendance1728929249651 implements MigrationInterface {
    name = 'Attendance1728929249651'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "clockInStatus" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "clockOutStatus" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "clockOutStatus" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance" ALTER COLUMN "clockInStatus" SET NOT NULL`);
    }

}
