import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { AppShowcase } from "@/components/landing/app-showcase";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonial } from "@/components/landing/testimonial";
import { FAQ } from "@/components/landing/faq";
import { Marquee } from "@/components/landing/marquee";
import { CTA } from "@/components/landing/cta";
import { SiteFooter } from "@/components/landing/site-footer";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <AppShowcase />
        <HowItWorks />
        <Testimonial />
        <FAQ />
        <Marquee />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}
