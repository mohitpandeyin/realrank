"use server";

import { createNewEntityCheckout } from "@/server/db/queries/payment-checkouts";
import { getRazorpayGateway, PaymentConfigurationError } from "@/server/payments/razorpay";

import type { ListingEntryState } from "./types";
import { listingEntrySchema } from "./validation";

export async function startListingCheckout(
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

  let checkout: Awaited<ReturnType<typeof createNewEntityCheckout>>;
  let publicKeyId: string;
  try {
    const razorpay = getRazorpayGateway();
    publicKeyId = razorpay.publicKeyId;
    checkout = await createNewEntityCheckout(
      {
        citySlug,
        entityName: parsed.data.entityName,
        contactPhoneE164: `+91${parsed.data.contactNumber}`,
        amountRupees: BigInt(parsed.data.rankAmount),
      },
      razorpay.gateway,
    );
  } catch (error) {
    if (error instanceof PaymentConfigurationError) {
      return {
        status: "error",
        message: "Test payments are not configured on this environment yet.",
      };
    }
    return {
      status: "error",
      message: "We could not start the secure payment right now. Please try again.",
    };
  }
  if (!checkout) {
    return {
      status: "error",
      message: "This city is not currently available for new listings.",
    };
  }

  return {
    status: "checkout",
    checkout: { ...checkout, publicKeyId },
    message: "Secure payment is ready.",
  };
}
