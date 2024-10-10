import { MigrationInterface, QueryRunner } from "typeorm";

export class LeadsEntityupdate31728586302955 implements MigrationInterface {
    name = 'LeadsEntityupdate31728586302955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" ADD "phoneNumber" character varying(15) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leads" DROP COLUMN "phoneNumber"`);
    }

}
