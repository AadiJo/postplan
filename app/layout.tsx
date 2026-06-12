import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "postplan",
  description: "Browse published agent plans by project.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
