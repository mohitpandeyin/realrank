import { z } from "zod";

function parsedRankAmount(value: string): bigint {
  return /^[0-9]+$/.test(value) ? BigInt(value) : 0n;
}

export const listingEntrySchema = z.object({
  entityName: z
    .string()
    .trim()
    .min(2, "Enter an entity name with at least 2 characters.")
    .max(160, "Keep the entity name within 160 characters."),
  contactNumber: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit Indian mobile number."),
  rankAmount: z
    .string()
    .trim()
    .regex(/^[0-9]+$/, "Enter a whole-rupee Rank Amount.")
    .refine((value) => parsedRankAmount(value) >= 10n, "Rank Amount must be at least ₹10.")
    .refine((value) => parsedRankAmount(value) <= 999_999_999n, "Rank Amount is too large."),
});

export type ListingEntryInput = z.infer<typeof listingEntrySchema>;
