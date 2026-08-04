CREATE INDEX "logs_level_idx" ON "logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "logs_service_idx" ON "logs" USING btree ("service");