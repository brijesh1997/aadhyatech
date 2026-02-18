import type { Metadata } from "next";
import { Syne, Heebo } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: '--font-syne',
  display: 'swap',
});

const heebo = Heebo({
  subsets: ["latin"],
  variable: '--font-heebo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Aadhyatech | Premium IT Solutions & Services",
  description: "Aadhyatech provides top-tier website development, mobile apps, and game design services. Transform your business with our premium IT solutions.",
  keywords: "IT Services, Web Development, App Development, Game Design, SaaS, Aadhyatech",
  openGraph: {
    title: "Aadhyatech | Premium IT Solutions",
    description: "Transform your business with Aadhyatech's premium IT services.",
    type: "website",
  }
};

import Cursor from "@/components/ui/Cursor";

import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${syne.variable} ${heebo.variable} font-body bg-white text-dark-900 antialiased selection:bg-purple-500 selection:text-white`}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <Cursor />
          <Toaster position="top-right" />
          {/* Global Vertical Line at 40px */}
          <div className="fixed top-0 left-[40px] w-[1px] h-full bg-gray-200 z-40 hidden lg:block"></div>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
