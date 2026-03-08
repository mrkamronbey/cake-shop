import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sweetcake.uz"),
  manifest: "/manifest.webmanifest",
  themeColor: "#f97462",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={montserrat.variable}>
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
