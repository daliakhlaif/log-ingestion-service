import { describe, it, expect } from "vitest";

import {
    logsQuerySchema,
    validateLogsQuery,
    decodeCursor,
} from "./logs.query";

describe("logs.query", () => {

    it("accepts valid query", () => {

        const result = logsQuerySchema.safeParse({
            service: "api",
            level: "info",
            limit: 20,
        });

        expect(result.success).toBe(true);

    });

    it("rejects invalid date range", () => {

        expect(() =>
            validateLogsQuery({

                since: "2026-08-02T00:00:00.000Z",

                until: "2026-08-01T00:00:00.000Z",

                limit: 50,

            })
        ).toThrow("until must be after since");

    });

    it("decodes valid cursor", () => {

        const cursor =
            "2026-08-01T14:00:00.000Z_123";

        const result =
            decodeCursor(cursor);

        expect(result.id).toBe(123);

        expect(result.timestamp)
            .toBeInstanceOf(Date);

    });

    it("rejects invalid cursor", () => {

        expect(() =>
            decodeCursor("invalid")
        ).toThrow("invalid cursor");

    });

});