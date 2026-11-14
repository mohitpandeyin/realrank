import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Realrank",
    template: "%s | Realrank",
  },
  description: "The real estate discovery index of companies and marketers.",
  applicationName: "Realrank",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#20201e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
