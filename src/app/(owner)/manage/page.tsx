import type { Metadata } from "next";

import { FoundationPage } from "@/components/ui/FoundationPage";

export const metadata: Metadata = { title: "Manage profile" };

export default function ManagePage() {
  return (
    <FoundationPage
      eyebrow="Owner profile"
      title="Manage profile"
      description="The shared public-and-owner profile structure is reserved here for the profile milestone."
    />
  );
}
