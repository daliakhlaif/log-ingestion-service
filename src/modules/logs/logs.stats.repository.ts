import { db } from "../../db/client";
import { logs } from "../../db/schema";
import {
    and,
    eq,
    gte,
    lte,
    sql,
} from "drizzle-orm";


export type StatsQuery = {
    service?: string;
    level?: string;
    since?: string;
    until?: string;
};


export class LogsStatsRepository {


    async aggregate(
        query: StatsQuery
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


        const where =
            conditions.length
                ? and(...conditions)
                : undefined;



        const [
            totalResult,
            byLevel,
            byService
        ] = await Promise.all([


            db
                .select({
                    count:
                        sql<number>`count(*)`,
                })
                .from(logs)
                .where(where),


            db
                .select({
                    level: logs.level,
                    count:
                        sql<number>`count(*)`,
                })
                .from(logs)
                .where(where)
                .groupBy(
                    logs.level
                ),


            db
                .select({
                    service: logs.service,
                    count:
                        sql<number>`count(*)`,
                })
                .from(logs)
                .where(where)
                .groupBy(
                    logs.service
                )

        ]);



        return {

            total:
                Number(
                    totalResult[0].count
                ),


            by_level:
                Object.fromEntries(
                    byLevel.map(item => [
                        item.level,
                        Number(item.count)
                    ])
                ),


            by_service:
                Object.fromEntries(
                    byService.map(item => [
                        item.service,
                        Number(item.count)
                    ])
                )

        };

    }

}