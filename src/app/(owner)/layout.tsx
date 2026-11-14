import type { Metadata } from "next";
import type { ReactNode } from "react";

import { OwnerShell } from "@/components/navigation/Shells";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function OwnerLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <OwnerShell>{children}</OwnerShell>;
}
