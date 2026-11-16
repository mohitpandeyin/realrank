import { describe, expect, it } from "vitest";

import { stepRankAmount } from "../../src/features/listing-entry/amount";
import { listingEntrySchema } from "../../src/features/listing-entry/validation";

describe("listing entry Rank Amount", () => {
  it("allows free-form values while buttons move to adjacent tens", () => {
    expect(stepRankAmount("151", "increase")).toBe("160");
    expect(stepRankAmount("151", "decrease")).toBe("150");
    expect(stepRankAmount("150", "decrease")).toBe("140");
  });

  it("never steps below the ten-rupee minimum", () => {
    expect(stepRankAmount("", "increase")).toBe("10");
    expect(stepRankAmount("9", "decrease")).toBe("10");
    expect(stepRankAmount("10", "decrease")).toBe("10");
  });
});

describe("listing entry validation", () => {
  it("accepts an Indian mobile number and whole-rupee amount", () => {
    expect(
      listingEntrySchema.safeParse({
        entityName: "Aarambh Realty",
        contactNumber: "9876543210",
        rankAmount: "151",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid mobile numbers, decimals and sub-minimum amounts", () => {
    expect(
      listingEntrySchema.safeParse({
        entityName: "A",
        contactNumber: "+91 98765 43210",
        rankAmount: "9.5",
      }).success,
    ).toBe(false);
  });
});
