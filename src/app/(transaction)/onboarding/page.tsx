import type { Metadata } from "next";

import { FoundationPage } from "@/components/ui/FoundationPage";

export const metadata: Metadata = { title: "Complete your profile" };

export default function OnboardingPage() {
  return (
    <FoundationPage
      eyebrow="Onboarding"
      title="Complete your profile"
      description="This route will require an unexpired payment-success session before OTP onboarding is enabled."
    />
  );
}
