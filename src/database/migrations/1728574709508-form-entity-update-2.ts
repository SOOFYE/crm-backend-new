import { MigrationInterface, QueryRunner } from "typeorm";

export class FormEntityUpdate21728574709508 implements MigrationInterface {
    name = 'FormEntityUpdate21728574709508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" ADD "selectedProducts" jsonb`);
        await queryRunner.query(`ALTER TABLE "leads" ADD "revenue" numeric(10,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "revenue"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "selectedProducts"`);
    }

}
