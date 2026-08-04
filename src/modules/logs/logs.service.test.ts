import { describe, it, expect, vi } from "vitest";
import { LogsService } from "./logs.service";
import { env } from "../../config/env";


describe("LogsService.ingest", () => {

    it("accepts valid logs and inserts them", async () => {

        const repository = {
            createMany: vi.fn()
                .mockResolvedValue(1),
            findMany: vi.fn(),
        };


        const service =
            new LogsService(repository as any);


        const result =
            await service.ingest([
                {
                    timestamp: new Date().toISOString(),
                    level: "info",
                    service: "api",
                    message: "hello",
                }
            ]);


        expect(result.accepted)
            .toBe(1);


        expect(result.rejected.length)
            .toBe(0);


        expect(repository.createMany)
            .toHaveBeenCalledOnce();

    });


    it("rejects invalid log level", async () => {

        const repository = {
            createMany: vi.fn(),
            findMany: vi.fn(),
        };


        const service =
            new LogsService(repository as any);


        const result =
            await service.ingest([
                {
                    timestamp: new Date().toISOString(),
                    level: "fatal",
                    service: "api",
                    message: "hello",
                }
            ]);


        expect(result.accepted)
            .toBe(0);


        expect(result.rejected[0].reason)
            .toBe("invalid level: 'fatal'");

    });


    it("rejects future timestamps", async () => {

        const repository = {
            createMany: vi.fn(),
            findMany: vi.fn(),
        };


        const service =
            new LogsService(repository as any);


        const future =
            new Date(
                Date.now() + 10 * 60 * 1000
            ).toISOString();


        const result =
            await service.ingest([
                {
                    timestamp: future,
                    level: "info",
                    service: "api",
                    message: "future log",
                }
            ]);


        expect(result.accepted)
            .toBe(0);


        expect(result.rejected[0].reason)
            .toBe(
                "timestamp is more than 5 minutes in the future"
            );

    });


    it("rejects non-array input", async () => {

        const repository = {
            createMany: vi.fn(),
            findMany: vi.fn(),
        };


        const service =
            new LogsService(repository as any);


        const result =
            await service.ingest({
                timestamp: new Date().toISOString(),
                level: "info",
                service: "api",
                message: "hello",
            });


        expect(result.accepted)
            .toBe(0);


        expect(result.rejected[0].reason)
            .toBe("logs must be an array");


        expect(repository.createMany)
            .not.toHaveBeenCalled();

    });


    it("rejects batch exceeding max size", async () => {

        const repository = {
            createMany: vi.fn(),
            findMany: vi.fn(),
        };


        const service =
            new LogsService(repository as any);


        const logs = Array.from(
            {
                length: env.MAX_LOG_BATCH_SIZE + 1
            },
            () => ({
                timestamp: new Date().toISOString(),
                level: "info",
                service: "api",
                message: "hello",
            })
        );


        const result =
            await service.ingest(logs);


        expect(result.accepted)
            .toBe(0);


        expect(result.rejected[0].reason)
            .toBe("batch size exceeds limit");


        expect(repository.createMany)
            .not.toHaveBeenCalled();

    });


});