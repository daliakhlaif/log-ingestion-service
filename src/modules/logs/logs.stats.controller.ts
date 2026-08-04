import {
    FastifyReply,
    FastifyRequest
} from "fastify";

import {
    LogsStatsService
} from "./logs.stats.service";


export class LogsStatsController {


    constructor(
        private readonly service:
            LogsStatsService
    ) { }



    async stats(
        request: FastifyRequest,
        reply: FastifyReply
    ) {


        const query =
            request.query as {
                service?: string;
                level?: string;
                since?: string;
                until?: string;
            };


        const result =
            await this.service.aggregate(
                query
            );


        return reply.send(
            result
        );

    }

}