import dynamic from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/features/landing/HeroSection";
import { HomeFooter } from "@/features/landing/HomeFooter";

const FeaturesSection = dynamic(
  () => import("@/features/landing/FeaturesSection").then((m) => m.FeaturesSection),
  { ssr: true }
);
const HowItWorksSection = dynamic(
  () => import("@/features/landing/HowItWorksSection").then((m) => m.HowItWorksSection),
  { ssr: true }
);
const StrategiesSection = dynamic(
  () => import("@/features/landing/StrategiesSection").then((m) => m.StrategiesSection),
  { ssr: true }
);
const SecuritySection = dynamic(
  () => import("@/features/landing/SecuritySection").then((m) => m.SecuritySection),
  { ssr: true }
);
const CtaSection = dynamic(
  () => import("@/features/landing/CtaSection").then((m) => m.CtaSection),
  { ssr: true }
);

export default function Home() {
  return (
    <>
      <Navbar />

      <main id="main-content">
        {/* Overview — eagerly loaded (above the fold) */}
        <HeroSection />

        {/* Below-fold sections — dynamically split for faster initial load */}
        <FeaturesSection />
        <HowItWorksSection />
        <StrategiesSection />
        <SecuritySection />
        <CtaSection />
      </main>

      <HomeFooter />
    </>
  );
}
