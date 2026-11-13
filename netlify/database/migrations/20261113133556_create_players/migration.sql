CREATE TABLE "players" (
	"id" text PRIMARY KEY,
	"state" jsonb NOT NULL,
	"version" integer DEFAULT 0 NOT NULL
);
