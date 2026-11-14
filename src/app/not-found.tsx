import Link from "next/link";

import { FoundationPage } from "@/components/ui/FoundationPage";

export default function NotFound() {
  return (
    <FoundationPage title="Page not found" description="This Realrank route is not available.">
      <p>
        <Link href="/">Return to Realrank</Link>
      </p>
    </FoundationPage>
  );
}
