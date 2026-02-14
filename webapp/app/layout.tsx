import type { Metadata } from "next";
import "../lib/polyfill";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { WalletProvider } from "@/providers/WalletProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

import { GoogleTagManager } from '@next/third-parties/google'

const geist_mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "900"],
  variable: "--font-geist-mono",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "900"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Deriverse Analytics",
  description: "Advanced Trading Analytics & Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <GoogleTagManager gtmId="GTM-NFKFC7XD" />
      <body className={`${geist.variable} ${geist_mono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
          themes={["light", "dark", "deriverse"]}
        >
          <WalletProvider>
            {children}
          </WalletProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
