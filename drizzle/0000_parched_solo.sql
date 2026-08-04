CREATE TABLE "logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"level" text NOT NULL,
	"service" text NOT NULL,
	"message" text NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "logs_timestamp_id_idx" ON "logs" USING btree ("timestamp","id");--> statement-breakpoint
CREATE INDEX "logs_service_timestamp_idx" ON "logs" USING btree ("service","timestamp");