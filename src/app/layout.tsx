import type { Metadata } from "next";
import { Cinzel, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Holdfast ELO",
  description: "Rangliste für Holdfast: Nations at War",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${cinzel.variable} ${shareTechMono.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-mono)]">
        {children}
      </body>
    </html>
  );
}
