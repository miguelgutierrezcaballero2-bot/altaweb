import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "AltaCocina — Equipamiento gastronómico B2B",
  description:
    "Equipamiento para pollerías, cafeterías y pizzerías: freidoras, hornos, café y refrigeración comercial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-ar">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
