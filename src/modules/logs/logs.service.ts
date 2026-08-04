import { LogsRepository } from "./logs.repository";
import { logEntrySchema } from "./logs.schema";
import { LogsQuery } from "./logs.query";
import { z } from "zod";
import { env } from "../../config/env";


const FIVE_MINUTES =
    5 * 60 * 1000;

type AcceptedLog =
    Omit<
        z.infer<typeof logEntrySchema>,
        "timestamp"
    >
    & {
        timestamp: Date;
    };


type RejectedLog = {
    index: number;
    reason: string;
};

export class LogsService {

    constructor(
        private readonly repository: LogsRepository
    ) { }


    async ingest(
        input: unknown
    ) {

        const logs = Array.isArray(input)
            ? input
            : null;


        if (!logs) {
            return {
                accepted: 0,
                rejected: [
                    {
                        index: -1,
                        reason: "logs must be an array"
                    }
                ]
            };
        }


        const accepted: AcceptedLog[] = [];
        const rejected: RejectedLog[] = [];

        if (logs.length > env.MAX_LOG_BATCH_SIZE) {
            return {
                accepted: 0,
                rejected: [
                    {
                        index: -1,
                        reason: "batch size exceeds limit"
                    }
                ]
            };
        }

        for (let index = 0; index < logs.length; index++) {

            const item = logs[index];


            const result =
                logEntrySchema.safeParse(item);


            if (!result.success) {

                const issue =
                    result.error.issues[0];


                let reason =
                    issue?.message ?? "invalid log";


                if (
                    issue?.path[0] === "level"
                ) {

                    const rawLevel =
                        typeof item === "object" &&
                            item !== null &&
                            "level" in item
                            ? item.level
                            : undefined;

                    reason =
                        `invalid level: '${rawLevel}'`;
                }


                rejected.push({
                    index,
                    reason,
                });

                continue;
            }


            const timestamp =
                new Date(result.data.timestamp);


            if (
                timestamp.getTime()
                >
                Date.now() + FIVE_MINUTES
            ) {

                rejected.push({
                    index,
                    reason:
                        "timestamp is more than 5 minutes in the future",
                });

                continue;
            }


            accepted.push({
                timestamp,
                level: result.data.level,
                service: result.data.service,
                message: result.data.message,
                attributes:
                    result.data.attributes,
            });

        }

        let inserted = 0;

        if (accepted.length > 0) {

            inserted =
                await this.repository.createMany(
                    accepted
                );

        }


        return {
            accepted: inserted,
            rejected,
        };

    }

    async find(
        query: LogsQuery
    ) {

        return this.repository.findMany(
            query
        );

    }

}