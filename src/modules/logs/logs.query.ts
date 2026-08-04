import { z } from "zod";

const levels = [
    "debug",
    "info",
    "warn",
    "error",
] as const;

export const logsQuerySchema =
    z.object({

        service:
            z.string()
                .min(1)
                .optional(),

        level:
            z.enum(levels)
                .optional(),

        since:
            z.string()
                .datetime()
                .optional(),

        until:
            z.string()
                .datetime()
                .optional(),

        q:
            z.string()
                .min(1)
                .optional(),

        limit:
            z.coerce
                .number()
                .int()
                .min(1)
                .max(100)
                .default(50),

        cursor:
            z.string()
                .optional(),

    });

export type LogsQuery =
    z.infer<typeof logsQuerySchema> & {
        attributes?: Record<string, string>;
    };

export function validateLogsQuery(
    query: LogsQuery
) {

    if (
        query.since &&
        query.until &&
        new Date(query.until) < new Date(query.since)
    ) {

        throw new Error(
            "until must be after since"
        );

    }

}

export function decodeCursor(cursor: string) {

    const [timestamp, id] =
        cursor.split("_");


    if (!timestamp || !id || Number.isNaN(Number(id))) {
        throw new Error(
            "invalid cursor"
        );
    }


    return {
        timestamp: new Date(timestamp),
        id: Number(id),
    };

}