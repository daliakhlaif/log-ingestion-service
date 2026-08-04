import fp from "fastify-plugin";
import { sql } from "drizzle-orm";

import { db, client } from "../db/client";


export default fp(async (app) => {

    try {

        await client`SELECT 1`;


        const result = await db.execute(
            sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'logs'
        );
      `
        );


        const migrationsReady =
            result[0]?.exists === true;


        if (!migrationsReady) {
            throw new Error(
                "Database migrations are not applied"
            );
        }


        app.decorate("db", db);


        app.addHook(
            "onClose",
            async () => {
                await client.end();
            }
        );


    } catch (error) {

        app.log.error(error);

        throw error;

    }

});