import { db } from "../../db/client";
import { logs } from "../../db/schema";
import { lt, sql } from "drizzle-orm";

export class LogsRetentionRepository {

    async deleteExpired(
        cutoff: Date,
        limit = 5000
    ) {

        const deleted =
            await db.execute(sql`
                DELETE FROM logs
                WHERE id IN (
                    SELECT id
                    FROM logs
                    WHERE timestamp < ${cutoff.toISOString()}
                    LIMIT ${limit}
                )
            `);

        return deleted;
    }

}