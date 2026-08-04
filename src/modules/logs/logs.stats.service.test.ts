import { describe, it, expect, vi } from "vitest";
import { LogsStatsService } from "./logs.stats.service";


describe("LogsStatsService.aggregate", () => {

    it("calls repository aggregate and returns result", async () => {

        const repository = {

            aggregate: vi.fn()
                .mockResolvedValue([
                    {
                        bucket: "2026-08-04T10:00:00.000Z",
                        count: 5,
                    }
                ])

        };


        const service =
            new LogsStatsService(repository as any);


        const query = {

            since: "2026-08-04T00:00:00.000Z",

            until: "2026-08-04T23:59:59.000Z",

            interval: "hour"

        };


        const result =
            await service.aggregate(query);


        expect(repository.aggregate)
            .toHaveBeenCalledOnce();


        expect(repository.aggregate)
            .toHaveBeenCalledWith(query);


        expect(result)
            .toEqual([
                {
                    bucket: "2026-08-04T10:00:00.000Z",
                    count: 5,
                }
            ]);

    });


});