import { FastifyReply, FastifyRequest } from "fastify";
import { LogsService } from "./logs.service";
import {
  decodeCursor,
  logsQuerySchema,
  validateLogsQuery,
  type LogsQuery
} from "./logs.query";

type IngestRequest = FastifyRequest<{
  Body: {
    logs?: unknown;
  };
}>;

export class LogsController {

  constructor(
    private readonly service: LogsService
  ) { }


  async ingest(
    request: IngestRequest,
    reply: FastifyReply
  ) {

    const result =
      await this.service.ingest(
        request.body.logs
      );


    if (
      result.accepted === 0
    ) {

      return reply
        .status(400)
        .send(result);

    }


    return reply
      .status(200)
      .send(result);

  }

  async find(
    request: FastifyRequest,
    reply: FastifyReply
  ) {

    try {

      const parsedQuery =
        logsQuerySchema.parse(
          request.query
        );

      const attributes =
        Object.entries(
          request.query as Record<string, string>
        )
          .filter(([key]) =>
            key.startsWith("attr.")
          )
          .reduce(
            (acc, [key, value]) => {

              acc[
                key.replace("attr.", "")
              ] = value;

              return acc;

            },
            {} as Record<string, string>
          );

      const query: LogsQuery = {
        ...parsedQuery,
        attributes,
      };

      validateLogsQuery(query);

      if (query.cursor) {
        decodeCursor(
          query.cursor
        );
      }
      
      const result =
        await this.service.find(query);

      return reply.send(result);

    } catch (error) {

      return reply
        .status(400)
        .send({
          error:
            error instanceof Error
              ? error.message
              : "invalid query",
        });

    }

  }
}

