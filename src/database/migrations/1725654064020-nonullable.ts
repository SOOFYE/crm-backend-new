import { MigrationInterface, QueryRunner } from "typeorm";

export class Nonullable1725654064020 implements MigrationInterface {
    name = 'Nonullable1725654064020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" ALTER COLUMN "filterCriteria" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" ALTER COLUMN "filterCriteria" SET NOT NULL`);
    }

}
