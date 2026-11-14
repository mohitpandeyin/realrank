import type { Metadata } from "next";
import type { ReactNode } from "react";

import { TransactionShell } from "@/components/navigation/Shells";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TransactionLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <TransactionShell>{children}</TransactionShell>;
}
