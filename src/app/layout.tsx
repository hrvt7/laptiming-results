import type { Metadata } from "next";
import { Orbitron, Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://laptiming-results.vercel.app"),
  title: "LAPTIMING | KAKUCS RING",
  description: "342 autó körideje a Kakucs Ringen. Jani vs Csabi.",
  openGraph: {
    title: "LAPTIMING | KAKUCS RING",
    description: "342 autó körideje a Kakucs Ringen. Jani vs Csabi.",
    type: "website",
    locale: "hu_HU",
  },
  twitter: {
    card: "summary_large_image",
    title: "LAPTIMING | KAKUCS RING",
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
      className={`dark ${orbitron.variable} ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#08080c] text-[#e4e1e8] font-[family-name:var(--font-inter)] antialiased selection:bg-[#00e5ff] selection:text-[#001f24]">
        {children}
      </body>
    </html>
  );
}
