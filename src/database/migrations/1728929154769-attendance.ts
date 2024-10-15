import { MigrationInterface, QueryRunner } from "typeorm";

export class Attendance1728929154769 implements MigrationInterface {
    name = 'Attendance1728929154769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "attendance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "clockIn" TIMESTAMP WITH TIME ZONE, "clockOut" TIMESTAMP WITH TIME ZONE, "absenteeStatus" character varying NOT NULL DEFAULT 'present', "clockInStatus" character varying NOT NULL DEFAULT 'clocked-in-early', "clockOutStatus" character varying NOT NULL DEFAULT 'clocked-in-early', "hoursWorked" integer, "agentId" uuid, CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_4fcd7dd61cf285f0e4b618a634c" FOREIGN KEY ("agentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_4fcd7dd61cf285f0e4b618a634c"`);
        await queryRunner.query(`DROP TABLE "attendance"`);
    }

}
