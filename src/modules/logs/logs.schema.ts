import { z } from "zod";


const levels = [
    "debug",
    "info",
    "warn",
    "error",
] as const;


export const logEntrySchema = z.object({

    timestamp: z
        .string()
        .datetime(),

    level: z.enum(levels),

    service: z
        .string()
        .min(1),

    message: z
        .string()
        .min(1),

    attributes: z
        .record(
            z.string(),
            z.union([
                z.string(),
                z.number(),
                z.boolean(),
            ])
        )
        .optional()
        .default({}),

});


export const ingestLogsSchema =
    z.object({

        logs: z.array(
            logEntrySchema
        )

    });