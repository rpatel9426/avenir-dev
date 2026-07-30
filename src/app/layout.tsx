import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryavenir.com";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Avenir — Your AI Running Companion",
    template: "%s · Avenir",
  },
  description:
    "Avenir is an AI running coach that guides every stride — real-time pacing, adaptive workouts, and a voice in your ear that knows exactly when to push.",
  applicationName: "Avenir",
  keywords: [
    "running coach",
    "AI running app",
    "run tracker",
    "pace coaching",
    "marathon training",
  ],
  authors: [{ name: "Avenir" }],
  appleWebApp: {
    capable: true,
    title: "Avenir",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "Avenir — Your AI Running Companion",
    description:
      "Real-time AI coaching for every run. Pace smarter, run further, finish stronger.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} min-h-dvh antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
