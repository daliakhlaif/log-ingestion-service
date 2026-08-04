import { FastifyInstance } from "fastify";
import { LogsRepository } from "./logs.repository";
import { LogsService } from "./logs.service";
import { LogsController } from "./logs.controller";
import { LogsStatsRepository } from "./logs.stats.repository";
import { LogsStatsService } from "./logs.stats.service";
import { LogsStatsController } from "./logs.stats.controller";

export async function logsRoutes(
    app: FastifyInstance
) {

    const repository =
        new LogsRepository();


    const service =
        new LogsService(
            repository
        );


    const controller =
        new LogsController(
            service
        );

    const statsRepository =
        new LogsStatsRepository();


    const statsService =
        new LogsStatsService(
            statsRepository
        );


    const statsController =
        new LogsStatsController(
            statsService
        );

    app.post(
        "/logs",
        controller.ingest.bind(controller)
    );

    app.get(
        "/logs",
        controller.find.bind(controller)
    );

    app.get(
        "/logs/stats",
        statsController.stats.bind(
            statsController
        )
    );

}