import type { Metadata } from "next";

import { FoundationPage } from "@/components/ui/FoundationPage";

export const metadata: Metadata = { title: "Admin access" };

export default function AdminAccessPage() {
  return (
    <FoundationPage
      eyebrow="Restricted access"
      title="Realrank operations"
      description="Staff identity, approval and MFA are intentionally deferred to the admin milestone."
    />
  );
}
