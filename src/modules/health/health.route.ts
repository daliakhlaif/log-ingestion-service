import { sql } from "drizzle-orm";
import { FastifyInstance } from "fastify";


export async function healthRoute(
    app: FastifyInstance
) {

    app.get("/health", async () => {

        await app.db.execute(
            sql`SELECT 1`
        );


        return {
            status: "ok",
            database: "connected",
        };

    });

}