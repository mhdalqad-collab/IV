import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import CurrencyProvider from "@/components/currency/CurrencyProvider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Selk.com | Find B2B storage, warehouses & industrial space",
  description:
    "Selk is the B2B marketplace for unused storage space. List your warehouse, basement, container, or back-of-house space — or book verified storage near you at market-driven prices.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="antialiased">
        <SessionProvider>
          <CurrencyProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </CurrencyProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
