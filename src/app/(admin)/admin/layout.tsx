import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/navigation/Shells";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AdminShell>{children}</AdminShell>;
}
