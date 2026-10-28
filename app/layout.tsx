import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WSP — Wireless Precision Mouse",
  description:
    "Discover WSP: precision-engineered wireless mouse with titanium drivers, aerospace-grade components, and zero-latency performance. Hear everything.",
  keywords: ["wireless mouse", "precision mouse", "WSP", "gaming mouse", "titanium drivers"],
  openGraph: {
    title: "WSP — Wireless Precision Mouse",
    description: "Precision Engineering. Titanium Drivers. Hear Everything.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#050505]">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
