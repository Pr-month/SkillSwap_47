CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE users_gender_enum AS ENUM ('male', 'female');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE users_role_enum AS ENUM ('USER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(64) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(128) NOT NULL,
  "parentId" uuid REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(32) NOT NULL,
  email varchar(128) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  about text,
  birthdate date NOT NULL,
  city varchar(64) NOT NULL,
  gender users_gender_enum NOT NULL,
  avatar varchar(255) NOT NULL DEFAULT '',
  role users_role_enum NOT NULL DEFAULT 'USER',
  "refreshToken" varchar(255)
);

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(128) NOT NULL,
  description text NOT NULL,
  images text[] NOT NULL DEFAULT '{}',
  "categoryId" uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  "ownerId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users_want_to_learn (
  "usersId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "categoriesId" uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY ("usersId", "categoriesId")
);

CREATE TABLE IF NOT EXISTS users_favorite_skills (
  "usersId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "skillsId" uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY ("usersId", "skillsId")
);

DO $$ BEGIN
  CREATE TYPE requests_status_enum AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'inProgress',
    'done'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  status requests_status_enum NOT NULL DEFAULT 'pending',
  "isRead" boolean NOT NULL DEFAULT false,
  "senderId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "receiverId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "offeredSkillId" uuid NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
  "requestedSkillId" uuid NOT NULL REFERENCES skills(id) ON DELETE RESTRICT
);
