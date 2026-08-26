import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import "./storybook.css";
import { AppProviders } from "@/components/AppProviders";
import { SyncIndicator } from "@/components/layout/SyncIndicator";
import { ViewModeBanner } from "@/components/layout/ViewModeBanner";
import { CaptureFab } from "@/components/layout/CaptureFab";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Minute by Minute",
  description: "A living illustrated storybook of your life.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Minute by Minute",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4ead8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} h-full`}
      data-experience="edit"
    >
      <body className="min-h-full antialiased">
        <AppProviders>
          <ViewModeBanner />
          <CaptureFab />
          <SyncIndicator />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
