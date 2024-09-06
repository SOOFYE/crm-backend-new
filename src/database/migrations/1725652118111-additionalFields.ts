import { MigrationInterface, QueryRunner } from "typeorm";

export class AdditionalFields1725652118111 implements MigrationInterface {
    name = 'AdditionalFields1725652118111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" ADD "additionalFields" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "campaigns" DROP COLUMN "additionalFields"`);
    }

}
