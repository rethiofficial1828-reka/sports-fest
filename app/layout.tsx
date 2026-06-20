import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/frontend/shared/context/QueryProvider";

export const metadata: Metadata = {
  title: {
    default: "SportsFest — College Sports Events Directory India",
    template: "%s | SportsFest",
  },
  description:
    "Discover college sports fests, tournaments, and games events across India. Cricket, Football, Chess, Athletics & 30+ sports at one place.",
  keywords: ["college sports", "sports fest", "college events", "cricket tournament", "India", "inter-college"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sportsfest.in",
    siteName: "SportsFest",
    title: "SportsFest — College Sports Events Directory India",
    description: "Discover college sports fests across India",
  },
  twitter: {
    card: "summary_large_image",
    title: "SportsFest — College Sports Events Directory India",
    description: "Discover college sports fests across India",
  },
  robots: { index: true, follow: true },
};

import { AuthProvider } from "@/frontend/shared/context/AuthContext";
import { EventProvider } from "@/frontend/shared/context/EventContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <QueryProvider>
          <AuthProvider>
            <EventProvider>
              {children}
            </EventProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
