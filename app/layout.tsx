import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/lib/toast/ToastContext";
import ToastContainer from "@/components/ToastContainer";
import { ThemeProvider } from "@/lib/theme/ThemeContext";

export const metadata: Metadata = {
  title: "Posts Manager - Next.js App",
  description: "Manage posts with pagination, sorting, and filtering",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
