import { MigrationInterface, QueryRunner } from "typeorm";

export class UserEntity1729201933793 implements MigrationInterface {
    name = 'UserEntity1729201933793'
    
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the column exists before dropping it
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'users' AND column_name = 'allowedBreakTimePerDay'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "allowedBreakTimePerDay";
                END IF;
            END
            $$;
        `);

        // Add the column
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "allowedBreakTimePerDay" character varying;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the column only if it exists
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'users' AND column_name = 'allowedBreakTimePerDay'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "allowedBreakTimePerDay";
                END IF;
            END
            $$;
        `);

        // Add the column back as an integer (rollback)
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "allowedBreakTimePerDay" integer;
        `);
    }
}
