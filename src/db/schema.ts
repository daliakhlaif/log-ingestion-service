import {
    pgTable,
    bigserial,
    text,
    timestamp,
    jsonb,
    index
} from "drizzle-orm/pg-core";


export const logs = pgTable(
    "logs",
    {
        id: bigserial("id", {
            mode: "number",
        }).primaryKey(),

        timestamp: timestamp("timestamp", {
            withTimezone: true,
        }).notNull(),

        level: text("level").notNull(),

        service: text("service").notNull(),

        message: text("message").notNull(),

        attributes: jsonb("attributes")
            .notNull()
            .default({}),
    },

    (table) => ({

        timestampIndex:
            index("logs_timestamp_id_idx")
                .on(
                    table.timestamp,
                    table.id
                ),


        serviceTimestampIndex:
            index("logs_service_timestamp_idx")
                .on(
                    table.service,
                    table.timestamp
                ),


        levelIndex:
            index("logs_level_idx")
                .on(
                    table.level
                ),


        serviceIndex:
            index("logs_service_idx")
                .on(
                    table.service
                ),

    })
);