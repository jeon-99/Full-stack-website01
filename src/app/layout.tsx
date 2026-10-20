import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ember & Oak — A small-batch general store",
  description:
    "Thoughtfully designed electronics, apparel, kitchen goods, and books. A full-stack e-commerce demo built with Next.js, Tailwind CSS, Prisma, and Zustand for the CodeAlpha internship.",
  keywords: [
    "ecommerce",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "Prisma",
    "Zustand",
    "CodeAlpha",
  ],
  authors: [{ name: "CodeAlpha Intern" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Ember & Oak — A small-batch general store",
    description:
      "Thoughtfully designed electronics, apparel, kitchen goods, and books.",
    siteName: "Ember & Oak",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
