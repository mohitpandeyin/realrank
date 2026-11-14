import { describe, expect, it } from "vitest";

import { parseServerEnvironment } from "../../src/config/environment";

describe("server environment", () => {
  it("parses the minimum local configuration", () => {
    expect(
      parseServerEnvironment({
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/realrank",
      }),
    ).toEqual({
      APP_ENV: "development",
      APP_URL: "http://localhost:3000",
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/realrank",
      DATABASE_SSL: false,
    });
  });

  it("rejects a missing database URL", () => {
    expect(() => parseServerEnvironment({})).toThrow();
  });
});
