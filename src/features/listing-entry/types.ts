export type ListingEntryField = "entityName" | "contactNumber" | "rankAmount";

export type ListingCheckout = Readonly<{
  checkoutId: string;
  orderId: string;
  publicKeyId: string;
  amountPaise: number;
  currency: "INR";
  estimatedPosition: number;
  expiresAt: string;
}>;

export type ListingEntryState = Readonly<{
  status: "idle" | "error" | "checkout";
  fieldErrors?: Partial<Record<ListingEntryField, readonly string[]>>;
  message?: string;
  checkout?: ListingCheckout;
}>;

export const initialListingEntryState: ListingEntryState = { status: "idle" };
