CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);
CREATE TABLE IF NOT EXISTS "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "jobs"(
  "id" integer primary key autoincrement not null,
  "queue" varchar not null,
  "payload" text not null,
  "attempts" integer not null,
  "reserved_at" integer,
  "available_at" integer not null,
  "created_at" integer not null
);
CREATE INDEX "jobs_queue_index" on "jobs"("queue");
CREATE TABLE IF NOT EXISTS "job_batches"(
  "id" varchar not null,
  "name" varchar not null,
  "total_jobs" integer not null,
  "pending_jobs" integer not null,
  "failed_jobs" integer not null,
  "failed_job_ids" text not null,
  "options" text,
  "cancelled_at" integer,
  "created_at" integer not null,
  "finished_at" integer,
  primary key("id")
);
CREATE TABLE IF NOT EXISTS "failed_jobs"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "connection" text not null,
  "queue" text not null,
  "payload" text not null,
  "exception" text not null,
  "failed_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs"("uuid");
CREATE TABLE IF NOT EXISTS "users"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  "is_admin" tinyint(1) not null default('0'),
  "photo" varchar,
  "is_approved" tinyint(1) not null default('0'),
  "title" varchar,
  "contact_number" varchar,
  "is_editor" tinyint(1) not null default('0'),
  "is_family" tinyint(1) not null default('0')
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE TABLE IF NOT EXISTS "locations"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "address" text,
  "image_path" varchar,
  "timezone" varchar not null default 'Africa/Johannesburg',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "saunas"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "capacity" integer not null default '8',
  "description" text,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "saunas_name_unique" on "saunas"("name");
CREATE TABLE IF NOT EXISTS "timeslots"(
  "id" integer primary key autoincrement not null,
  "sauna_schedule_id" integer not null,
  "starts_at" datetime not null,
  "ends_at" datetime not null,
  "capacity" integer not null default '8',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("sauna_schedule_id") references "sauna_schedules"("id") on delete cascade
);
CREATE UNIQUE INDEX "timeslots_sauna_schedule_id_starts_at_unique" on "timeslots"(
  "sauna_schedule_id",
  "starts_at"
);
CREATE TABLE IF NOT EXISTS "services"(
  "id" integer primary key autoincrement not null,
  "code" varchar not null,
  "name" varchar not null,
  "category" varchar check("category" in('session', 'addon')) not null,
  "price" numeric not null,
  "active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE UNIQUE INDEX "services_code_unique" on "services"("code");
CREATE TABLE IF NOT EXISTS "booking_service"(
  "id" integer primary key autoincrement not null,
  "booking_id" integer not null,
  "service_id" integer not null,
  "quantity" integer not null,
  "price_each" numeric not null,
  "line_total" numeric not null,
  "created_at" datetime,
  "updated_at" datetime,
  "meta" text,
  foreign key("booking_id") references "bookings"("id") on delete cascade,
  foreign key("service_id") references "services"("id") on delete cascade
);
CREATE UNIQUE INDEX "booking_service_booking_id_service_id_unique" on "booking_service"(
  "booking_id",
  "service_id"
);
CREATE TABLE IF NOT EXISTS "events"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "description" text,
  "default_price" integer,
  "default_capacity" integer,
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "event_occurrences"(
  "id" integer primary key autoincrement not null,
  "location_id" integer not null,
  "start_time" time not null,
  "end_time" time not null,
  "price" integer,
  "capacity" integer,
  "is_active" tinyint(1) not null default('1'),
  "created_at" datetime,
  "updated_at" datetime,
  "event_id" integer,
  "occurs_on" date,
  foreign key("location_id") references locations("id") on delete cascade on update no action,
  foreign key("event_id") references "events"("id") on delete cascade
);
CREATE UNIQUE INDEX "event_occ_unique" on "event_occurrences"(
  "event_id",
  "occurs_on",
  "start_time"
);
CREATE TABLE IF NOT EXISTS "bookings"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "timeslot_id" integer,
  "people" integer not null,
  "status" varchar not null default('pending'),
  "amount" numeric not null,
  "created_at" datetime,
  "updated_at" datetime,
  "peach_payment_checkout_id" varchar,
  "payment_status" varchar not null default('pending'),
  "bookable_type" varchar,
  "bookable_id" integer,
  "event_occurrence_id" integer,
  foreign key("user_id") references users("id") on delete cascade on update no action,
  foreign key("timeslot_id") references timeslots("id") on delete cascade on update no action,
  foreign key("event_occurrence_id") references "event_occurrences"("id") on delete cascade
);
CREATE INDEX "bookings_bookable_type_bookable_id_index" on "bookings"(
  "bookable_type",
  "bookable_id"
);
CREATE INDEX "bookings_user_id_timeslot_id_index" on "bookings"(
  "user_id",
  "timeslot_id"
);
CREATE TABLE IF NOT EXISTS "location_openings"(
  "id" integer primary key autoincrement not null,
  "location_id" integer not null,
  "weekday" integer not null,
  "created_at" datetime,
  "updated_at" datetime,
  "sauna_id" integer not null,
  "period" varchar,
  "start_time" time,
  "end_time" time,
  foreign key("location_id") references locations("id") on delete cascade on update no action,
  foreign key("sauna_id") references saunas("id") on delete cascade on update no action
);
CREATE UNIQUE INDEX "location_openings_location_id_weekday_period_unique" on "location_openings"(
  "location_id",
  "weekday",
  "period"
);
CREATE UNIQUE INDEX "loc_day_per_unique" on "location_openings"(
  "location_id",
  "weekday",
  "period"
);
CREATE UNIQUE INDEX loc_open_unique
ON location_openings(
  location_id,
  weekday,
  sauna_id,
  period
);
CREATE TABLE IF NOT EXISTS "sauna_schedules"(
  "id" integer primary key autoincrement not null,
  "sauna_id" integer not null,
  "location_id" integer not null,
  "date" date not null,
  "period" varchar not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("sauna_id") references "saunas"("id") on delete cascade,
  foreign key("location_id") references "locations"("id") on delete cascade
);
CREATE UNIQUE INDEX "sauna_sched_unique" on "sauna_schedules"(
  "sauna_id",
  "location_id",
  "date",
  "period"
);

INSERT INTO migrations VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO migrations VALUES(7,'0001_01_01_000001_create_cache_table',2);
INSERT INTO migrations VALUES(8,'0001_01_01_000002_create_jobs_table',2);
INSERT INTO migrations VALUES(9,'2024_11_11_131755_add_is_admin_to_users_table',2);
INSERT INTO migrations VALUES(10,'2024_11_11_133416_add_is_admin_to_users_table',2);
INSERT INTO migrations VALUES(11,'2024_11_11_134545_add_is_admin_to_users_table',2);
INSERT INTO migrations VALUES(12,'2024_11_11_134559_add_is_admin_to_users_table',2);
INSERT INTO migrations VALUES(13,'2024_11_12_103931_add_photo_column_to_users_table',3);
INSERT INTO migrations VALUES(14,'2024_11_12_145024_create_organizations_table',4);
INSERT INTO migrations VALUES(15,'2024_11_13_132651_add_organization_id_to_users_table',5);
INSERT INTO migrations VALUES(16,'2024_11_14_141805_add_is_approved_to_users_table',6);
INSERT INTO migrations VALUES(17,'2024_11_15_082256_create_chats_table',7);
INSERT INTO migrations VALUES(18,'2024_11_19_104136_add_description_and_category_to_organizations_table',8);
INSERT INTO migrations VALUES(19,'2024_11_19_130153_add_website_to_organizations_table',9);
INSERT INTO migrations VALUES(20,'2024_11_20_111622_create_events_table',10);
INSERT INTO migrations VALUES(21,'2024_11_21_131134_create_resources_table',11);
INSERT INTO migrations VALUES(22,'2024_11_25_111630_create_policies_table',12);
INSERT INTO migrations VALUES(23,'2024_11_25_153144_add_parent_id_to_chats_table',13);
INSERT INTO migrations VALUES(24,'2024_11_26_091249_add_fields_to_users_table',14);
INSERT INTO migrations VALUES(25,'2024_11_27_143515_create_newsletters_table',15);
INSERT INTO migrations VALUES(26,'2024_11_28_124050_make_organization_id_nullable_in_resources_table',16);
INSERT INTO migrations VALUES(27,'2024_11_28_132027_add_is_family_to_resources_table',17);
INSERT INTO migrations VALUES(28,'2024_11_28_135126_create_family_galleries_table',18);
INSERT INTO migrations VALUES(29,'2025_05_27_133549_drop_newsletters_table',19);
INSERT INTO migrations VALUES(30,'2025_05_27_133739_drop_organizations_table',20);
INSERT INTO migrations VALUES(31,'2025_05_27_135025_drop_resources_table',21);
INSERT INTO migrations VALUES(32,'2025_05_27_135142_drop_family_galleries_table',22);
INSERT INTO migrations VALUES(33,'2025_05_27_135256_drop_events_table',23);
INSERT INTO migrations VALUES(34,'2025_05_27_135357_drop_chats_table',24);
INSERT INTO migrations VALUES(35,'2025_05_27_135444_drop_policies_table',25);
INSERT INTO migrations VALUES(36,'2025_05_28_093632_create_locations_table',26);
INSERT INTO migrations VALUES(37,'2025_05_28_093632_create_sauna_schedules_table',26);
INSERT INTO migrations VALUES(38,'2025_05_28_093632_create_saunas_table',26);
INSERT INTO migrations VALUES(39,'2025_05_28_093632_create_timeslots_table',26);
INSERT INTO migrations VALUES(40,'2025_05_28_093633_create_bookings_table',26);
INSERT INTO migrations VALUES(41,'2025_05_28_094827_create_addons_table',27);
INSERT INTO migrations VALUES(42,'2025_05_28_095713_add_unique_name_to_addons',28);
INSERT INTO migrations VALUES(43,'2025_05_28_095950_create_addon_booking_table',29);
INSERT INTO migrations VALUES(44,'2025_06_03_133117_add_period_to_sauna_schedules',30);
INSERT INTO migrations VALUES(45,'2025_06_03_141608_drop_old_unique_on_sauna_schedule',31);
INSERT INTO migrations VALUES(46,'2025_06_10_125827_create_services_table',32);
INSERT INTO migrations VALUES(47,'2025_06_10_131512_drop_legacy_addon_tables',33);
INSERT INTO migrations VALUES(48,'2025_06_17_100058_create_location_openings_table',34);
INSERT INTO migrations VALUES(49,'2025_06_18_132105_create_booking_service_table',35);
INSERT INTO migrations VALUES(50,'2025_06_19_085519_drop_unique_user_timeslot_on_bookings_table',36);
INSERT INTO migrations VALUES(51,'2025_06_19_112044_add_sauna_id_to_location_openings_table',37);
INSERT INTO migrations VALUES(52,'2025_07_14_130057_add_payment_fields_to_bookings_table',38);
INSERT INTO migrations VALUES(53,'2025_07_14_145514_create_events_table',39);
INSERT INTO migrations VALUES(54,'2025_07_14_150249_add_polymorphic_booking_to_bookings_table',40);
INSERT INTO migrations VALUES(55,'2025_07_21_092106_reshape_events_into_templates_and_occurrences',41);
INSERT INTO migrations VALUES(56,'2025_07_30_091700_add_event_occurrence_to_bookings_table',42);
INSERT INTO migrations VALUES(57,'2025_08_08_085549_add_meta_to_booking_service',43);
INSERT INTO migrations VALUES(58,'2025_08_08_123127_add_time_range_to_location_openings',44);
INSERT INTO migrations VALUES(62,'2025_08_08_123423_fill_and_lock_times_on_location_openings_fresh',45);
INSERT INTO migrations VALUES(63,'2025_08_08_143139_fix_unique_key_on_location_openings',46);
INSERT INTO migrations VALUES(64,'2025_08_08_143609_update_unique_key_on_location_openings',47);
INSERT INTO migrations VALUES(65,'2025_08_08_144050_rebuild_loc_open_unique',48);
INSERT INTO migrations VALUES(66,'2025_08_08_144511_purge_old_unique_indexes_on_location_openings',49);
INSERT INTO migrations VALUES(67,'2025_08_13_074931_create_sauna_schedules_table',50);
