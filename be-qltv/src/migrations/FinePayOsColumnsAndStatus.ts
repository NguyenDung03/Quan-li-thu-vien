import { MigrationInterface, QueryRunner } from 'typeorm';

export class FinePayOsColumnsAndStatus1744483200000 implements MigrationInterface {
  name = 'FinePayOsColumnsAndStatus1744483200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "fines_payment_method_enum" AS ENUM ('CASH', 'PAYOS');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "fines" ADD COLUMN IF NOT EXISTS "payment_code" integer;
    `);
    await queryRunner.query(`
      ALTER TABLE "fines" ADD COLUMN IF NOT EXISTS "payment_method" "fines_payment_method_enum";
    `);
    await queryRunner.query(`
      ALTER TABLE "fines" ADD COLUMN IF NOT EXISTS "collected_by" uuid;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_fines_payment_code"
      ON "fines" ("payment_code")
      WHERE "payment_code" IS NOT NULL;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "fines"
          ADD CONSTRAINT "FK_fines_collected_by"
          FOREIGN KEY ("collected_by") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TYPE "public"."fines_status_enum" ADD VALUE IF NOT EXISTS 'pending';
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."fines_status_enum" ADD VALUE IF NOT EXISTS 'cancelled';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fines" DROP CONSTRAINT IF EXISTS "FK_fines_collected_by";
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_fines_payment_code";
    `);
    await queryRunner.query(`
      ALTER TABLE "fines" DROP COLUMN IF EXISTS "collected_by";
    `);
    await queryRunner.query(`
      ALTER TABLE "fines" DROP COLUMN IF EXISTS "payment_method";
    `);
    await queryRunner.query(`
      ALTER TABLE "fines" DROP COLUMN IF EXISTS "payment_code";
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS "fines_payment_method_enum";
    `);
  }
}
