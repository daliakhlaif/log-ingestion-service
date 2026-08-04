import Fastify from "fastify";
import { healthRoute } from "./modules/health/health.route";
import databasePlugin from "./plugins/database";
import { logsRoutes } from "./modules/logs/logs.route";

export function buildApp() {

    const app = Fastify({
        logger: true,
    });


    app.register(databasePlugin);

    app.register(healthRoute);

    app.register(logsRoutes);

    return app;
}