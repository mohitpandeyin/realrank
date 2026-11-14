import { describe, expect, it } from "vitest";

import { can } from "../../src/features/auth/policy";

describe("authorization policy", () => {
  it("does not let owners reconcile payments", () => {
    expect(can("owner", "payment:reconcile")).toBe(false);
  });

  it("keeps staff management administrator-only", () => {
    expect(can("reviewer", "staff:manage")).toBe(false);
    expect(can("finance", "staff:manage")).toBe(false);
    expect(can("administrator", "staff:manage")).toBe(true);
  });

  it("reserves financial fulfilment for the system worker", () => {
    expect(can("administrator", "fulfilment:execute")).toBe(false);
    expect(can("system", "fulfilment:execute")).toBe(true);
  });
});
