import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Toaster } from "sonner";
import {NextIntlClientProvider} from 'next-intl';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Easy ERP - Student Management System",
  description: "Low-cost ERP solution for educational institutions. Streamline admissions, fee collection, hostel allocation, and library management.",
  icons: {
    icon: '/logoEasyErp.png',
    apple: '/logoEasyErp.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="custom"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </NextAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
