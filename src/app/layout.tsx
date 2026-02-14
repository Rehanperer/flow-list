import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "FlowList AI",
  description: "Master your day with AI-powered task management and wealth tracking.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="bottom-right" theme="light" />
        {children}
      </body>
    </html>
  );
}
