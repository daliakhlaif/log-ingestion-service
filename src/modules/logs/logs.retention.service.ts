import { env } from "../../config/env";
import { LogsRetentionRepository } from "./logs.retention.repository";

export class LogsRetentionService {

    constructor(
        private readonly repository =
            new LogsRetentionRepository()
    ) { }

    async run() {

        const cutoff =
            new Date(
                Date.now() -
                env.RETENTION_DAYS *
                24 *
                60 *
                60 *
                1000
            );

        while (true) {

            const result =
                await this.repository.deleteExpired(
                    cutoff
                );

            if (
                result.count === 0
            ) {
                break;
            }

        }

    }

}