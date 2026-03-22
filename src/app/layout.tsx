import type { Metadata } from "next";
import { Orbitron, Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://laptiming-results.vercel.app"),
  title: "Laptiming Results — Kakucs Ring",
  description: "342 autó körideje a Kakucs Ringen. Jani vs Csabi.",
  openGraph: {
    title: "Laptiming Results — Kakucs Ring",
    description: "342 autó körideje a Kakucs Ringen. Jani vs Csabi.",
    type: "website",
    locale: "hu_HU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Laptiming Results — Kakucs Ring",
    description: "342 autó körideje a Kakucs Ringen. Jani vs Csabi.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${orbitron.variable} ${barlow.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen grid-bg antialiased">{children}</body>
    </html>
  );
}
