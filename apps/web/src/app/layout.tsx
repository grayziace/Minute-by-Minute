import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Cormorant_Garamond, Caveat } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import { BottomNav } from "@/components/layout/BottomNav";
import { FloatingAddButton } from "@/components/layout/FloatingAddButton";
import { SyncIndicator } from "@/components/layout/SyncIndicator";
import { ExperienceToggle } from "@/components/layout/ExperienceToggle";

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
  description: "A cinematic archive of present moments.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Minute by Minute",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f8ff",
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
      <body className="min-h-full flex flex-col antialiased">
        <AppProviders>
          <ExperienceToggle />
          <SyncIndicator />
          <div className="flex-1">{children}</div>
          <BottomNav />
          <FloatingAddButton />
        </AppProviders>
      </body>
    </html>
  );
}
