"use server";

import { getNewEntityRankQuote } from "@/server/db/queries/ranking-quotes";

import type { ListingEntryState } from "./types";
import { listingEntrySchema } from "./validation";

export async function quoteListingEntry(
  citySlug: string,
  _previousState: ListingEntryState,
  formData: FormData,
): Promise<ListingEntryState> {
  const parsed = listingEntrySchema.safeParse({
    entityName: formData.get("entityName"),
    contactNumber: formData.get("contactNumber"),
    rankAmount: formData.get("rankAmount"),
  });

  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      fieldErrors: {
        entityName: fields.entityName,
        contactNumber: fields.contactNumber,
        rankAmount: fields.rankAmount,
      },
      message: "Check the highlighted details and try again.",
    };
  }

  let quote: Awaited<ReturnType<typeof getNewEntityRankQuote>>;
  try {
    quote = await getNewEntityRankQuote(citySlug, BigInt(parsed.data.rankAmount));
  } catch {
    return {
      status: "error",
      message: "We could not check the position right now. Please try again.",
    };
  }
  if (!quote) {
    return {
      status: "error",
      message: "This city is not currently available for new listings.",
    };
  }

  return {
    status: "quoted",
    quote,
    message: "Your estimated position is ready. It will be checked again before payment.",
  };
}
