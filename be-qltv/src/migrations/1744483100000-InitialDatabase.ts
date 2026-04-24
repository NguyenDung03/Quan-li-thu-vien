import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDatabase1744483100000 implements MigrationInterface {
  name = 'InitialDatabase1744483100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "system_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "setting_key" character varying NOT NULL, "setting_value" text NOT NULL, CONSTRAINT "UQ_9037e7dec102dfdfb0c5343807f" UNIQUE ("setting_key"), CONSTRAINT "PK_82521f08790d248b2a80cc85d40" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "parent_id" character varying, CONSTRAINT "UQ_2e52d4551e36324b9c82bbae4c8" UNIQUE ("name"), CONSTRAINT "PK_23cd2d376c4ce915f1f5994a4a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "original_name" character varying NOT NULL, "file_name" character varying NOT NULL, "slug" character varying NOT NULL, "cloudinary_url" text NOT NULL, "cloudinary_public_id" character varying NOT NULL, "file_size" integer NOT NULL, "mime_type" character varying NOT NULL, "width" integer, "height" integer, "format" character varying NOT NULL, CONSTRAINT "PK_1fe148074c6a1a91b63cb9ee3c9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "publishers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "publisher_name" character varying NOT NULL, "address" text, "phone" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_9d73f23749dca512efc3ccbea6a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "authors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "author_name" character varying NOT NULL, "bio" text, "nationality" character varying NOT NULL, CONSTRAINT "PK_d2ed02fabd9b52847ccb85e6b88" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_authors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "book_id" uuid NOT NULL, "author_id" uuid NOT NULL, CONSTRAINT "PK_53395bd77b067b716d2ab96b9ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "grade_levels" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text, "order_no" integer NOT NULL, CONSTRAINT "UQ_a93812ae2bb22d1c2938deed492" UNIQUE ("name"), CONSTRAINT "PK_6acd477de8b53978fc389479713" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_grade_levels" ("book_id" uuid NOT NULL, "grade_level_id" uuid NOT NULL, CONSTRAINT "PK_0268d85112d093830f82a2c9046" PRIMARY KEY ("book_id", "grade_level_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."books_book_type_enum" AS ENUM('ebook', 'physical')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."books_physical_type_enum" AS ENUM('library_use', 'borrowable')`,
    );
    await queryRunner.query(
      `CREATE TABLE "books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "isbn" character varying NOT NULL, "publish_year" integer NOT NULL, "edition" character varying NOT NULL, "description" text, "cover_image_id" uuid, "cover_image" text, "language" character varying NOT NULL DEFAULT 'vi', "page_count" integer NOT NULL, "book_type" "public"."books_book_type_enum" NOT NULL DEFAULT 'physical', "physical_type" "public"."books_physical_type_enum", "publisher_id" uuid NOT NULL, "main_category_id" uuid NOT NULL, CONSTRAINT "UQ_54337dc30d9bb2c3fadebc69094" UNIQUE ("isbn"), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "floor" integer, "section" character varying NOT NULL, "shelf" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_3540a4df2635b9aab5c8538088c" UNIQUE ("slug"), CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."physical_copies_status_enum" AS ENUM('available', 'borrowed', 'reserved', 'damaged', 'lost', 'maintenance')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."physical_copies_currentcondition_enum" AS ENUM('new', 'good', 'worn', 'damaged')`,
    );
    await queryRunner.query(
      `CREATE TABLE "physical_copies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "book_id" uuid NOT NULL, "barcode" character varying NOT NULL, "status" "public"."physical_copies_status_enum" NOT NULL DEFAULT 'available', "currentCondition" "public"."physical_copies_currentcondition_enum" NOT NULL DEFAULT 'good', "condition_details" text, "purchase_date" date, "purchase_price" numeric(12,2), "price" numeric(12,2), "location_id" uuid NOT NULL, "notes" text, "last_checkup_date" date, "is_archived" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_eab98e14a0aa989bce295e8db98" UNIQUE ("barcode"), CONSTRAINT "PK_aa882c0fad4744c49f234e6b899" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reader_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type_name" character varying NOT NULL, "max_borrow_limit" integer NOT NULL, "borrow_duration_days" integer NOT NULL, CONSTRAINT "PK_b73b8188cb17e456833c2c7191a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'reader')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_account_status_enum" AS ENUM('active', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'reader', "account_status" "public"."users_account_status_enum" NOT NULL DEFAULT 'active', "last_login" TIMESTAMP, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."readers_gender_enum" AS ENUM('male', 'female', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "readers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "reader_type_id" uuid NOT NULL, "full_name" character varying NOT NULL, "dob" date NOT NULL, "gender" "public"."readers_gender_enum" NOT NULL, "address" text NOT NULL, "phone" character varying NOT NULL, "card_number" character varying NOT NULL, "card_issue_date" date NOT NULL, "card_expiry_date" date NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_e95ee33ad765eaf6cea127d3cbf" UNIQUE ("card_number"), CONSTRAINT "REL_2e5d94878c0160669463db32a4" UNIQUE ("user_id"), CONSTRAINT "PK_4564309186c3e23496d65a80b4d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."borrow_records_status_enum" AS ENUM('borrowed', 'returned', 'overdue', 'renewed', 'lost')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."borrow_records_condition_at_borrow_enum" AS ENUM('new', 'good', 'worn', 'damaged')`,
    );
    await queryRunner.query(
      `CREATE TABLE "borrow_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reader_id" uuid NOT NULL, "copy_id" uuid NOT NULL, "borrow_date" TIMESTAMP NOT NULL, "due_date" TIMESTAMP NOT NULL, "return_date" TIMESTAMP, "status" "public"."borrow_records_status_enum" NOT NULL DEFAULT 'borrowed', "librarian_id" uuid NOT NULL, "is_renewed" boolean NOT NULL DEFAULT false, "condition_at_borrow" "public"."borrow_records_condition_at_borrow_enum", "book_id" uuid, CONSTRAINT "PK_b403bf5f85354e7a86867585152" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fines_status_enum" AS ENUM('pending', 'unpaid', 'paid', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."fines_payment_method_enum" AS ENUM('CASH', 'PAYOS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "fines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "borrow_id" uuid NOT NULL, "fine_amount" numeric(12,2) NOT NULL, "fine_date" TIMESTAMP NOT NULL, "reason" text NOT NULL, "status" "public"."fines_status_enum" NOT NULL DEFAULT 'unpaid', "payment_date" TIMESTAMP, "payment_code" integer, "payos_checkout_url" text, "payment_method" "public"."fines_payment_method_enum", "collected_by" uuid, CONSTRAINT "UQ_d305f915d40d2b718530108476d" UNIQUE ("payment_code"), CONSTRAINT "PK_b706344bc8943ab7a88ed5d312e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "uploads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "original_name" character varying NOT NULL, "file_name" character varying NOT NULL, "slug" character varying NOT NULL, "file_path" character varying NOT NULL, "file_size" integer NOT NULL, "mime_type" character varying NOT NULL, "file_format" character varying NOT NULL, CONSTRAINT "PK_d1781d1eedd7459314f60f39bd3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ebooks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "book_id" uuid NOT NULL, "file_path" character varying NOT NULL, "file_size" integer NOT NULL, "file_format" character varying NOT NULL, "download_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_f600cbbd351e1a2b5157abe3111" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source_url" text, "file_path" text, "file_uri" text, "displayName" character varying(255), "mime_type" character varying(100), "status" character varying(50) NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reservations_status_enum" AS ENUM('pending', 'fulfilled', 'cancelled', 'expired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "reservations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reader_id" uuid NOT NULL, "book_id" uuid NOT NULL, "reservation_date" TIMESTAMP NOT NULL, "expiry_date" TIMESTAMP NOT NULL, "status" "public"."reservations_status_enum" NOT NULL DEFAULT 'pending', "cancellation_reason" text, "copy_id" uuid, CONSTRAINT "PK_da95cef71b617ac35dc5bcda243" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "reading_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reader_id" uuid NOT NULL, "book_id" uuid NOT NULL, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP, "progress_percentage" numeric(5,2) NOT NULL DEFAULT '0', CONSTRAINT "PK_fea39783024da119636add4bc21" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors" ADD CONSTRAINT "FK_1d68802baf370cd6818cad7a503" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors" ADD CONSTRAINT "FK_6fb8ac32a0a0bbca076b2cf7c5a" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_grade_levels" ADD CONSTRAINT "FK_49c7cb3e2099cd5dcfc3ce9f7ca" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_grade_levels" ADD CONSTRAINT "FK_9875d50a026800e425068ec0a90" FOREIGN KEY ("grade_level_id") REFERENCES "grade_levels"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "FK_370ec5bbafd46f74b23a20a5298" FOREIGN KEY ("publisher_id") REFERENCES "publishers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "FK_bf7fe40c5449e31215e01ef60a7" FOREIGN KEY ("main_category_id") REFERENCES "book_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "FK_e2230e16f5fe4e86c7d0b7004e5" FOREIGN KEY ("cover_image_id") REFERENCES "images"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "physical_copies" ADD CONSTRAINT "FK_8ada6ae3133d0584520e5c4bccf" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "physical_copies" ADD CONSTRAINT "FK_e901a89f14dfc72cd8b1efc940d" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "readers" ADD CONSTRAINT "FK_2e5d94878c0160669463db32a48" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "readers" ADD CONSTRAINT "FK_84f131a870a51e650b48ee3eddc" FOREIGN KEY ("reader_type_id") REFERENCES "reader_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrow_records" ADD CONSTRAINT "FK_d1b181e499570912c2a82e4d1af" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrow_records" ADD CONSTRAINT "FK_eff50c0033ed1d47fe8e6d499ff" FOREIGN KEY ("copy_id") REFERENCES "physical_copies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrow_records" ADD CONSTRAINT "FK_12314beb7a035db83398121980e" FOREIGN KEY ("librarian_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrow_records" ADD CONSTRAINT "FK_ffe42824c6619410ae86622542a" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fines" ADD CONSTRAINT "FK_6341b42857e560f9312949ce535" FOREIGN KEY ("collected_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fines" ADD CONSTRAINT "FK_e3c3efbd7dc285ea1e955234606" FOREIGN KEY ("borrow_id") REFERENCES "borrow_records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ebooks" ADD CONSTRAINT "FK_bf8a0109654d433865d2ecd0730" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_6bc994430ab8f138171d34957b4" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_ba6032a12f831ebf8cc3bc69c45" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_e8654179793503c65ebfe4c0d07" FOREIGN KEY ("copy_id") REFERENCES "physical_copies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reading_history" ADD CONSTRAINT "FK_6d5a3e1a422040e15bf647bd81c" FOREIGN KEY ("reader_id") REFERENCES "readers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reading_history" ADD CONSTRAINT "FK_b3585ea38e0b4282070cb215831" FOREIGN KEY ("book_id") REFERENCES "books"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reading_history" DROP CONSTRAINT "FK_b3585ea38e0b4282070cb215831"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reading_history" DROP CONSTRAINT "FK_6d5a3e1a422040e15bf647bd81c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_e8654179793503c65ebfe4c0d07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_ba6032a12f831ebf8cc3bc69c45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_6bc994430ab8f138171d34957b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ebooks" DROP CONSTRAINT "FK_bf8a0109654d433865d2ecd0730"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fines" DROP CONSTRAINT "FK_e3c3efbd7dc285ea1e955234606"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fines" DROP CONSTRAINT "FK_6341b42857e560f9312949ce535"`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrow_records" DROP CONSTRAINT "FK_ffe42824c6619410ae86622542a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrow_records" DROP CONSTRAINT "FK_12314beb7a035db83398121980e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrow_records" DROP CONSTRAINT "FK_eff50c0033ed1d47fe8e6d499ff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "borrow_records" DROP CONSTRAINT "FK_d1b181e499570912c2a82e4d1af"`,
    );
    await queryRunner.query(
      `ALTER TABLE "readers" DROP CONSTRAINT "FK_84f131a870a51e650b48ee3eddc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "readers" DROP CONSTRAINT "FK_2e5d94878c0160669463db32a48"`,
    );
    await queryRunner.query(
      `ALTER TABLE "physical_copies" DROP CONSTRAINT "FK_e901a89f14dfc72cd8b1efc940d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "physical_copies" DROP CONSTRAINT "FK_8ada6ae3133d0584520e5c4bccf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" DROP CONSTRAINT "FK_e2230e16f5fe4e86c7d0b7004e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" DROP CONSTRAINT "FK_bf7fe40c5449e31215e01ef60a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" DROP CONSTRAINT "FK_370ec5bbafd46f74b23a20a5298"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_grade_levels" DROP CONSTRAINT "FK_9875d50a026800e425068ec0a90"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_grade_levels" DROP CONSTRAINT "FK_49c7cb3e2099cd5dcfc3ce9f7ca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors" DROP CONSTRAINT "FK_6fb8ac32a0a0bbca076b2cf7c5a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_authors" DROP CONSTRAINT "FK_1d68802baf370cd6818cad7a503"`,
    );
    await queryRunner.query(`DROP TABLE "reading_history"`);
    await queryRunner.query(`DROP TABLE "reservations"`);
    await queryRunner.query(`DROP TYPE "public"."reservations_status_enum"`);
    await queryRunner.query(`DROP TABLE "documents"`);
    await queryRunner.query(`DROP TABLE "ebooks"`);
    await queryRunner.query(`DROP TABLE "uploads"`);
    await queryRunner.query(`DROP TABLE "fines"`);
    await queryRunner.query(`DROP TYPE "public"."fines_payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "public"."fines_status_enum"`);
    await queryRunner.query(`DROP TABLE "borrow_records"`);
    await queryRunner.query(
      `DROP TYPE "public"."borrow_records_condition_at_borrow_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."borrow_records_status_enum"`);
    await queryRunner.query(`DROP TABLE "readers"`);
    await queryRunner.query(`DROP TYPE "public"."readers_gender_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_account_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TABLE "reader_types"`);
    await queryRunner.query(`DROP TABLE "physical_copies"`);
    await queryRunner.query(
      `DROP TYPE "public"."physical_copies_currentcondition_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."physical_copies_status_enum"`);
    await queryRunner.query(`DROP TABLE "locations"`);
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(`DROP TYPE "public"."books_physical_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."books_book_type_enum"`);
    await queryRunner.query(`DROP TABLE "book_grade_levels"`);
    await queryRunner.query(`DROP TABLE "grade_levels"`);
    await queryRunner.query(`DROP TABLE "book_authors"`);
    await queryRunner.query(`DROP TABLE "authors"`);
    await queryRunner.query(`DROP TABLE "publishers"`);
    await queryRunner.query(`DROP TABLE "images"`);
    await queryRunner.query(`DROP TABLE "book_categories"`);
    await queryRunner.query(`DROP TABLE "system_settings"`);
  }
}
