import type { Metadata } from "next";
import "./globals.css";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "OpenCRM",
  description: "Open Source CRM Alternative",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-bg text-text-primary">
        <ErrorBoundary>
          {children}
          <CommandPalette />
        </ErrorBoundary>
      </body>
    </html>
  );
}
