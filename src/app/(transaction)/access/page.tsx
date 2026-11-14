import type { Metadata } from "next";

import { FoundationPage } from "@/components/ui/FoundationPage";

export const metadata: Metadata = { title: "Owner access" };

export default function AccessPage() {
  return (
    <FoundationPage
      eyebrow="Owner access"
      title="Manage your Realrank profile"
      description="Phone access and OTP are intentionally deferred to the authentication milestone."
    />
  );
}
