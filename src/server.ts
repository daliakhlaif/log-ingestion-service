import { env } from "./config/env";
import { buildApp } from "./app";
import { LogsRetentionService }
  from "./modules/logs/logs.retention.service";

const start = async () => {

  try {

    const app = buildApp();

    await app.listen({
      port: env.PORT,
      host: "0.0.0.0",
    });

    console.log(
      `Server running on port ${env.PORT}`
    );

    const retention =
      new LogsRetentionService();

    await retention.run();

    setInterval(
      async () => {

        try {

          await retention.run();

        } catch (error) {

          app.log.error(error);

        }

      },

      60 * 60 * 1000
    );

  } catch (error) {

    console.error(error);

    process.exit(1);

  }

};


start();

