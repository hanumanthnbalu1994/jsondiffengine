import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "JSON Diff Engine - Compare & Visualize JSON Differences Online",
  description:
    "Free online JSON diff tool to compare, visualize, and analyze differences between JSON files. Side-by-side comparison with syntax highlighting, validation, and instant results.",
  keywords: [
    "json diff",
    "json compare",
    "json difference",
    "compare json online",
    "json validator",
    "json comparison tool",
    "diff checker",
    "json merge",
    "json formatter",
    "online json diff",
  ],
  authors: [{ name: "JSON Diff Engine" }],
  creator: "JSON Diff Engine",
  publisher: "JSON Diff Engine",
  robots: "index, follow",
  openGraph: {
    title: "JSON Diff Engine - Compare JSON Online",
    description:
      "Free online tool to compare and visualize differences between JSON files with side-by-side view, syntax highlighting, and instant validation.",
    type: "website",
    locale: "en_US",
    siteName: "JSON Diff Engine",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Diff Engine - Compare JSON Online",
    description:
      "Free online JSON comparison tool with side-by-side diff view and syntax highlighting.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
