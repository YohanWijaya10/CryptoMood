CREATE TABLE "sentiment_cache" (
	"guid" varchar(255) PRIMARY KEY NOT NULL,
	"sentiment" jsonb NOT NULL,
	"text_hash" varchar(32) NOT NULL,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
