import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "@/components/UserProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "FitTrack — AI Fitness Coach",
  description: "AI-powered nutrition, weight, and fitness tracking dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitTrack",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#06b6d4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-slate-950 text-slate-50 antialiased">
        <UserProvider>{children}</UserProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
