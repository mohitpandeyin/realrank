import type { Metadata } from "next";

import { FoundationPage } from "@/components/ui/FoundationPage";

export const metadata: Metadata = { title: "Payment status" };

export default function PaymentStatusPage() {
  return (
    <FoundationPage
      eyebrow="Payment"
      title="Payment status"
      description="This route will require an opaque checkout-status session when payments are implemented."
    />
  );
}
