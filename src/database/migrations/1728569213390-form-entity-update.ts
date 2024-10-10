import { MigrationInterface, QueryRunner } from "typeorm";

export class FormEntityUpdate1728569213390 implements MigrationInterface {
    name = 'FormEntityUpdate1728569213390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "forms" ADD "productsAndPrices" jsonb NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "forms" DROP COLUMN "productsAndPrices"`);
    }

}
