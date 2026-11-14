import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/ui/PublicInfoPage";

export const metadata: Metadata = { title: "Help & Support" };

export default function HelpPage() {
  return (
    <PublicInfoPage
      title="Help & Support"
      description="The shared help and issue-reporting route is ready for its implementation milestone."
    />
  );
}
