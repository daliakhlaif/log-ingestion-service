import { db } from "../db/client";

declare module "fastify" {
  interface FastifyInstance {
    db: typeof db;
  }
}