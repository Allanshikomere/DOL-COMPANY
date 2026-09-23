import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OYIGO — Mobile Financing Tracker & Float Ledger",
  description: "Executive ledger, inventory pipeline, and multi-account profit tracking for mobile device financing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
