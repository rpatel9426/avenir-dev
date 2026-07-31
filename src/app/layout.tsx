import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PwaRegister } from "@/components/pwa-register";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tryavenir.com";

/* Sans carries everything the runner does. */
const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

/* Mono is reserved for machine facts — labels, dates, readouts. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/* Serif is reserved for the coach's voice and moments of becoming. */
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f2ed" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e0f" },
  ],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} min-h-dvh antialiased`}
      >
        {/* Light for the app, dark for the run — the run screen opts itself in. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
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
