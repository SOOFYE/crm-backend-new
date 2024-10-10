import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadsEntityupdate1728508877866 implements MigrationInterface {
    name = 'LeadsEntityupdate1728508877866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" ADD "formId" uuid`);
        await queryRunner.query(`ALTER TABLE "leads" ADD CONSTRAINT "FK_08e50b251ecb4417800af268b26" FOREIGN KEY ("formId") REFERENCES "forms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" DROP CONSTRAINT "FK_08e50b251ecb4417800af268b26"`);
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "formId"`);
    }

}
