import { MigrationInterface, QueryRunner } from 'typeorm';

export class PayOsPaymentCodeSequence1744483300000 implements MigrationInterface {
  name = 'PayOsPaymentCodeSequence1744483300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE SEQUENCE IF NOT EXISTS "fines_payment_code_seq"
        AS integer
        START WITH 100000
        INCREMENT BY 1
        MINVALUE 100000
        MAXVALUE 2147483647;
    `);
    await queryRunner.query(`
      ALTER TABLE "fines" ADD COLUMN IF NOT EXISTS "payos_checkout_url" text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fines" DROP COLUMN IF EXISTS "payos_checkout_url";
    `);
    await queryRunner.query(`
      DROP SEQUENCE IF EXISTS "fines_payment_code_seq";
    `);
  }
}
