import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SessionProvider from "@/components/providers/SessionProvider";
import CurrencyProvider from "@/components/currency/CurrencyProvider";
import LocaleProvider from "@/components/i18n/LocaleProvider";
import { LOCALE_DIR } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Selk.om | Find B2B storage, warehouses & industrial space",
  description:
    "Selk is the B2B marketplace for unused storage space. List your warehouse, basement, container, or back-of-house space — or book verified storage near you at market-driven prices.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();
  const dir = LOCALE_DIR[locale];
  return (
    <html lang={locale} dir={dir} className={jakarta.variable}>
      <body className="antialiased">
        <SessionProvider>
          <LocaleProvider initialLocale={locale}>
            <CurrencyProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </CurrencyProvider>
          </LocaleProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
