export type ListingEntryField = "entityName" | "contactNumber" | "rankAmount";

export type ListingQuote = Readonly<{
  amountRupees: string;
  estimatedPosition: number;
  firstPlaceAmountRupees: string;
  expiresAt: string;
}>;

export type ListingEntryState = Readonly<{
  status: "idle" | "error" | "quoted";
  fieldErrors?: Partial<Record<ListingEntryField, readonly string[]>>;
  message?: string;
  quote?: ListingQuote;
}>;

export const initialListingEntryState: ListingEntryState = { status: "idle" };
