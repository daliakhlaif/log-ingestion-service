import {
    LogsStatsRepository,
    StatsQuery
} from "./logs.stats.repository";


export class LogsStatsService {

    constructor(
        private readonly repository:
            LogsStatsRepository
    ) { }


    async aggregate(
        query: StatsQuery
    ) {

        return this.repository.aggregate(
            query
        );

    }

}