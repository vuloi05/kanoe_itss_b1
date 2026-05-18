import type { Metadata } from "next";
import { Be_Vietnam_Pro, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PresenceProvider } from "@/contexts/PresenceContext";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VietImmerse - Master Northern Vietnamese",
  description:
    "VietImmerseで北部ベトナム語をマスターしましょう。ハノイの街角で、もっと自由に。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="light">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Material Symbols is an icon font not supported by next/font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${beVietnamPro.variable} ${manrope.variable} antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>
            <PresenceProvider>
              {children}
            </PresenceProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

