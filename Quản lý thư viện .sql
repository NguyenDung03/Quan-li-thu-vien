CREATE TABLE "Users" (
  "id" uuid PRIMARY KEY,
  "username" varchar UNIQUE,
  "email" varchar UNIQUE,
  "password" varchar,
  "role" varchar,
  "account_status" varchar,
  "created_at" datetime,
  "last_login" datetime
);

CREATE TABLE "ReaderTypes" (
  "id" uuid PRIMARY KEY,
  "type_name" varchar,
  "max_borrow_limit" int,
  "borrow_duration_days" int
);

CREATE TABLE "Readers" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid,
  "reader_type_id" uuid,
  "full_name" varchar,
  "dob" date,
  "gender" varchar,
  "address" text,
  "phone" varchar,
  "card_number" varchar UNIQUE,
  "card_issue_date" date,
  "card_expiry_date" date,
  "is_active" boolean
);

CREATE TABLE "Books" (
  "id" uuid PRIMARY KEY,
  "title" varchar,
  "isbn" varchar UNIQUE,
  "publish_year" int,
  "edition" varchar,
  "description" text,
  "cover_image_id" uuid,
  "language" varchar,
  "page_count" int,
  "book_type" varchar,
  "physical_type" varchar,
  "publisher_id" uuid,
  "main_category_id" uuid
);

CREATE TABLE "Authors" (
  "id" uuid PRIMARY KEY,
  "author_name" varchar,
  "bio" text,
  "nationality" varchar
);

CREATE TABLE "BookAuthors" (
  "id" uuid PRIMARY KEY,
  "book_id" uuid,
  "author_id" uuid
);

CREATE TABLE "Publishers" (
  "id" uuid PRIMARY KEY,
  "publisher_name" varchar,
  "address" text,
  "phone" varchar,
  "email" varchar
);

CREATE TABLE "GradeLevels" (
  "id" uuid PRIMARY KEY,
  "name" varchar UNIQUE,
  "description" text,
  "order_no" int
);

CREATE TABLE "BookCategories" (
  "id" uuid PRIMARY KEY,
  "name" varchar UNIQUE,
  "parent_id" uuid
);

CREATE TABLE "BookGradeLevels" (
  "book_id" uuid,
  "grade_level_id" uuid,
  PRIMARY KEY ("book_id", "grade_level_id")
);

CREATE TABLE "Locations" (
  "id" uuid PRIMARY KEY,
  "name" varchar,
  "slug" varchar UNIQUE,
  "description" text,
  "floor" int,
  "section" varchar,
  "shelf" varchar,
  "is_active" boolean,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "PhysicalCopies" (
  "id" uuid PRIMARY KEY,
  "book_id" uuid,
  "barcode" varchar UNIQUE,
  "status" varchar,
  "current_condition" varchar,
  "condition_details" text,
  "purchase_date" date,
  "purchase_price" decimal,
  "location_id" uuid,
  "notes" text,
  "last_checkup_date" date,
  "is_archived" boolean
);

CREATE TABLE "EBooks" (
  "id" uuid PRIMARY KEY,
  "book_id" uuid,
  "file_path" varchar,
  "file_size" int,
  "file_format" varchar,
  "download_count" int
);

CREATE TABLE "Images" (
  "id" uuid PRIMARY KEY,
  "original_name" varchar,
  "file_name" varchar,
  "slug" varchar,
  "cloudinary_url" text,
  "cloudinary_public_id" varchar,
  "file_size" int,
  "mime_type" varchar,
  "width" int,
  "height" int,
  "format" varchar,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "Uploads" (
  "id" uuid PRIMARY KEY,
  "original_name" varchar,
  "file_name" varchar,
  "slug" varchar,
  "file_path" varchar,
  "file_size" int,
  "mime_type" varchar,
  "created_at" datetime,
  "updated_at" datetime
);

CREATE TABLE "BorrowRecords" (
  "id" uuid PRIMARY KEY,
  "reader_id" uuid,
  "copy_id" uuid,
  "borrow_date" datetime,
  "due_date" datetime,
  "return_date" datetime,
  "status" varchar,
  "librarian_id" uuid
);

CREATE TABLE "Reservations" (
  "id" uuid PRIMARY KEY,
  "reader_id" uuid,
  "book_id" uuid,
  "reservation_date" datetime,
  "expiry_date" datetime,
  "status" varchar
);

CREATE TABLE "Fines" (
  "id" uuid PRIMARY KEY,
  "borrow_id" uuid,
  "fine_amount" decimal,
  "fine_date" datetime,
  "reason" text,
  "status" varchar,
  "payment_date" datetime
);

CREATE TABLE "ReadingHistory" (
  "id" uuid PRIMARY KEY,
  "reader_id" uuid,
  "book_id" uuid,
  "start_date" datetime,
  "end_date" datetime,
  "progress_percentage" decimal
);

ALTER TABLE "Readers" ADD FOREIGN KEY ("user_id") REFERENCES "Users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Readers" ADD FOREIGN KEY ("reader_type_id") REFERENCES "ReaderTypes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Books" ADD FOREIGN KEY ("cover_image_id") REFERENCES "Images" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Books" ADD FOREIGN KEY ("publisher_id") REFERENCES "Publishers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Books" ADD FOREIGN KEY ("main_category_id") REFERENCES "BookCategories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "BookAuthors" ADD FOREIGN KEY ("book_id") REFERENCES "Books" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "BookAuthors" ADD FOREIGN KEY ("author_id") REFERENCES "Authors" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "BookCategories" ADD FOREIGN KEY ("parent_id") REFERENCES "BookCategories" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "BookGradeLevels" ADD FOREIGN KEY ("book_id") REFERENCES "Books" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "BookGradeLevels" ADD FOREIGN KEY ("grade_level_id") REFERENCES "GradeLevels" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "PhysicalCopies" ADD FOREIGN KEY ("book_id") REFERENCES "Books" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "PhysicalCopies" ADD FOREIGN KEY ("location_id") REFERENCES "Locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "EBooks" ADD FOREIGN KEY ("book_id") REFERENCES "Books" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "BorrowRecords" ADD FOREIGN KEY ("reader_id") REFERENCES "Readers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "BorrowRecords" ADD FOREIGN KEY ("copy_id") REFERENCES "PhysicalCopies" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "BorrowRecords" ADD FOREIGN KEY ("librarian_id") REFERENCES "Users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Reservations" ADD FOREIGN KEY ("reader_id") REFERENCES "Readers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Reservations" ADD FOREIGN KEY ("book_id") REFERENCES "Books" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "Fines" ADD FOREIGN KEY ("borrow_id") REFERENCES "BorrowRecords" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ReadingHistory" ADD FOREIGN KEY ("reader_id") REFERENCES "Readers" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "ReadingHistory" ADD FOREIGN KEY ("book_id") REFERENCES "Books" ("id") DEFERRABLE INITIALLY IMMEDIATE;
