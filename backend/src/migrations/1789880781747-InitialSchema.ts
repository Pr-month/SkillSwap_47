import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1789880781747 implements MigrationInterface {
  name = 'InitialSchema1789880781747';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(128) NOT NULL, "parentId" uuid, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(64) NOT NULL, CONSTRAINT "UQ_a0ae8d83b7d32359578c486e7f6" UNIQUE ("name"), CONSTRAINT "PK_4762ffb6e5d198cfec5606bc11e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_gender_enum" AS ENUM('male', 'female')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(32) NOT NULL, "email" character varying(128) NOT NULL, "password" character varying(255) NOT NULL, "about" text, "birthdate" date NOT NULL, "city" character varying(64) NOT NULL, "gender" "public"."users_gender_enum" NOT NULL, "avatar" character varying(255) NOT NULL DEFAULT '', "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "refreshToken" character varying(255), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "skills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(128) NOT NULL, "description" text NOT NULL, "images" text array NOT NULL DEFAULT '{}', "categoryId" uuid NOT NULL, "ownerId" uuid NOT NULL, CONSTRAINT "PK_0d3212120f4ecedf90864d7e298" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."requests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'inProgress', 'done')`,
    );
    await queryRunner.query(
      `CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."requests_status_enum" NOT NULL DEFAULT 'pending', "isRead" boolean NOT NULL DEFAULT false, "senderId" uuid NOT NULL, "receiverId" uuid NOT NULL, "offeredSkillId" uuid NOT NULL, "requestedSkillId" uuid NOT NULL, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_want_to_learn" ("usersId" uuid NOT NULL, "categoriesId" uuid NOT NULL, CONSTRAINT "PK_169e7523123732f834509800331" PRIMARY KEY ("usersId", "categoriesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7493596b3894a59f806fd0966" ON "users_want_to_learn"  ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f4849f1cabd9f08ec223b8c19" ON "users_want_to_learn"  ("categoriesId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users_favorite_skills" ("usersId" uuid NOT NULL, "skillsId" uuid NOT NULL, CONSTRAINT "PK_4d35e9a8f1b756fe7df5390fe7c" PRIMARY KEY ("usersId", "skillsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f4dd30d884d5f7ab9436dca9cc" ON "users_favorite_skills"  ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_780a505b9f6b5602abc1ef189a" ON "users_favorite_skills"  ("skillsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "FK_06d267f85858229c10a01a08ad7" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" ADD CONSTRAINT "FK_7f11181516e823da9421dc5433d" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_670f44ad50fac2e635f4213fa9b" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_df2b65da9fe84c28e82f221bcd5" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_305aae1d71ec0c00921c91aeae8" FOREIGN KEY ("offeredSkillId") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" ADD CONSTRAINT "FK_e7acd23bb9c360b83cb3bfecfa6" FOREIGN KEY ("requestedSkillId") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_want_to_learn" ADD CONSTRAINT "FK_c7493596b3894a59f806fd09662" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_want_to_learn" ADD CONSTRAINT "FK_6f4849f1cabd9f08ec223b8c193" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorite_skills" ADD CONSTRAINT "FK_f4dd30d884d5f7ab9436dca9cc2" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorite_skills" ADD CONSTRAINT "FK_780a505b9f6b5602abc1ef189a6" FOREIGN KEY ("skillsId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_favorite_skills" DROP CONSTRAINT "FK_780a505b9f6b5602abc1ef189a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_favorite_skills" DROP CONSTRAINT "FK_f4dd30d884d5f7ab9436dca9cc2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_want_to_learn" DROP CONSTRAINT "FK_6f4849f1cabd9f08ec223b8c193"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_want_to_learn" DROP CONSTRAINT "FK_c7493596b3894a59f806fd09662"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_e7acd23bb9c360b83cb3bfecfa6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_305aae1d71ec0c00921c91aeae8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_df2b65da9fe84c28e82f221bcd5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "requests" DROP CONSTRAINT "FK_670f44ad50fac2e635f4213fa9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP CONSTRAINT "FK_7f11181516e823da9421dc5433d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "skills" DROP CONSTRAINT "FK_06d267f85858229c10a01a08ad7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_780a505b9f6b5602abc1ef189a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f4dd30d884d5f7ab9436dca9cc"`,
    );
    await queryRunner.query(`DROP TABLE "users_favorite_skills"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f4849f1cabd9f08ec223b8c19"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7493596b3894a59f806fd0966"`,
    );
    await queryRunner.query(`DROP TABLE "users_want_to_learn"`);
    await queryRunner.query(`DROP TABLE "requests"`);
    await queryRunner.query(`DROP TYPE "public"."requests_status_enum"`);
    await queryRunner.query(`DROP TABLE "skills"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
    await queryRunner.query(`DROP TABLE "cities"`);
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
