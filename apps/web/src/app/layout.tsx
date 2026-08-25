import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Cormorant_Garamond, Caveat } from "next/font/google";
import "./globals.css";
import "./storybook.css";
import { AppProviders } from "@/components/AppProviders";
import { SyncIndicator } from "@/components/layout/SyncIndicator";
import { ExperienceToggle } from "@/components/layout/ExperienceToggle";
import { ViewModeBanner } from "@/components/layout/ViewModeBanner";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${instrument.variable} ${cormorant.variable} ${caveat.variable} h-full`}
      data-experience="edit"
    >
      <body className="min-h-full antialiased">
        <AppProviders>
          <ViewModeBanner />
          <ExperienceToggle />
          <SyncIndicator />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
