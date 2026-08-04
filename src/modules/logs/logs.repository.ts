import { db } from "../../db/client";
import { logs } from "../../db/schema";
import { LogsQuery } from "./logs.query";
import { decodeCursor } from "./logs.query";
import {
    or,
    lt,
    and,
    desc,
    eq,
    gte,
    sql,
    lte,
    ilike,
} from "drizzle-orm";


export class LogsRepository {


    async createMany(
        data: typeof logs.$inferInsert[]
    ) {

        if (data.length === 0) {
            return 0;
        }


        const BATCH_SIZE = 5000;


        let inserted = 0;


        await db.transaction(
            async (tx) => {

                for (
                    let i = 0;
                    i < data.length;
                    i += BATCH_SIZE
                ) {

                    const batch =
                        data.slice(
                            i,
                            i + BATCH_SIZE
                        );


                    await tx
                        .insert(logs)
                        .values(batch);


                    inserted += batch.length;

                }

            }
        );


        return inserted;

    }



    async findMany(
        query: LogsQuery
    ) {

        const conditions = [];


        if (query.service) {

            conditions.push(
                eq(
                    logs.service,
                    query.service
                )
            );

        }


        if (query.level) {

            conditions.push(
                eq(
                    logs.level,
                    query.level
                )
            );

        }


        if (query.since) {

            conditions.push(
                gte(
                    logs.timestamp,
                    new Date(query.since)
                )
            );

        }


        if (query.until) {

            conditions.push(
                lte(
                    logs.timestamp,
                    new Date(query.until)
                )
            );

        }


        if (query.q) {

            conditions.push(
                ilike(
                    logs.message,
                    `%${query.q}%`
                )
            );

        }

        if (query.attributes) {

            for (
                const [key, value]
                of Object.entries(query.attributes)
            ) {

                conditions.push(
                    sql`${logs.attributes}->>${key} = ${value}`
                );

            }

        }

        if (query.cursor) {
            const parts =
                query.cursor.split("_");


            if (parts.length !== 2) {
                throw new Error("invalid cursor");
            }


            const [
                cursorTimestamp,
                cursorId
            ] = parts;

            conditions.push(
                or(
                    lt(
                        logs.timestamp,
                        new Date(cursorTimestamp)
                    ),

                    and(
                        eq(
                            logs.timestamp,
                            new Date(cursorTimestamp)
                        ),

                        lt(
                            logs.id,
                            Number(cursorId)
                        )
                    )
                )
            );

        }

        const result =
            await db
                .select()
                .from(logs)
                .where(
                    conditions.length
                        ? and(...conditions)
                        : undefined
                )
                .orderBy(
                    desc(logs.timestamp),
                    desc(logs.id)
                )
                .limit(
                    query.limit + 1
                );


        const hasMore =
            result.length > query.limit;


        const items =
            hasMore
                ? result.slice(0, query.limit)
                : result;


        const last =
            items[items.length - 1];


        return {
            logs: items,

            next_cursor:
                hasMore && last
                    ? `${last.timestamp.toISOString()}_${last.id}`
                    : null
        };
    }

}