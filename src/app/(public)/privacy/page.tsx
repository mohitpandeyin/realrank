import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/ui/PublicInfoPage";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <PublicInfoPage
      title="Privacy"
      description="Privacy content will be finalized before launch."
    />
  );
}
