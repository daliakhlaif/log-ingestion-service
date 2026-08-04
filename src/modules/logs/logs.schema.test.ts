import { describe, it, expect } from "vitest";
import { logEntrySchema } from "./logs.schema";

describe("logEntrySchema", () => {

    it("accepts valid log", () => {

        const result = logEntrySchema.safeParse({

            timestamp: new Date().toISOString(),
            level: "info",
            service: "api",
            message: "hello",

        });

        expect(result.success).toBe(true);

    });

    it("rejects invalid level", () => {

        const result = logEntrySchema.safeParse({

            timestamp: new Date().toISOString(),
            level: "fatal",
            service: "api",
            message: "hello",

        });

        expect(result.success).toBe(false);

    });

});