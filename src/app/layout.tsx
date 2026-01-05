import { Providers } from "./providers";
import "@/styles/globals.css";
import Script from "next/script";
import { DynamicFavicon } from "@/components/DynamicFavicon";
import { DynamicSEO } from "@/components/DynamicSEO";
import { CustomCodeInjection } from "@/components/CustomCodeInjection";
import { CustomFooterCode } from "@/components/CustomFooterCode";
import ReduxProvider from "@/lib/ReduxProvider";

export const metadata = {
  title: "Tutor Connect - Find the Perfect Tutor",
  description:
    "Connect with qualified tutors for personalized learning experiences.",
  icons: {
    icon: "/icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#16a34a" },
    { media: "(prefers-color-scheme: dark)", color: "#22c55e" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider>
      <html lang="en" suppressHydrationWarning className="light h-full">
        <body className="bg-background text-foreground overflow-x-hidden min-h-screen m-0 p-0 smooth-scroll mobile-safe-area">
          <Script id="theme-script" strategy="afterInteractive">
            {`
            (function() {
              // Always default to light theme on initial load
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
            })()
          `}
          </Script>
          <DynamicFavicon />
          <DynamicSEO />
          <CustomCodeInjection />
          <Providers>{children}</Providers>
          <CustomFooterCode />
        </body>
      </html>
    </ReduxProvider>
  );
}
