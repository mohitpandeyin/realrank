import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/ui/PublicInfoPage";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <PublicInfoPage
      title="Refund Policy"
      description="Refund and reversal terms will be finalized before payments are enabled."
    />
  );
}
