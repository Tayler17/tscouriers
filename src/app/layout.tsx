import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import ClientProviders from "@/components/ClientProviders";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "TS Couriers & Dominican Shipping | UK to DR & Europe Logistics",
  description: "Specialized door-to-door shipping to Dominican Republic, daily UK courier, and international freight to Spain & Europe. London's trusted logistics partner.",
  keywords: "shipping to dominican republic, london courier, uk to spain freight, door to door DR, ts couriers, dominican shipping london",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased font-sans`}
      >
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </div>
          <WhatsAppFloat />
        </ClientProviders>
      </body>
    </html>
  );
}
