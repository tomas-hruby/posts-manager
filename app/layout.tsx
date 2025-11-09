import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Posts Manager - Next.js App",
  description: "Manage posts with pagination, sorting, and filtering",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900">{children}</body>
    </html>
  );
}
