import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/features/landing/HeroSection";
import { HomeFooter } from "@/features/landing/HomeFooter";
import { MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";

export const metadata: Metadata = {
  title: "NeuroWealth — AI-Powered Yield on Stellar",
  description:
    "NeuroWealth is an autonomous AI agent that deploys your USDC into the highest-yielding DeFi opportunities on Stellar — automatically, 24/7. No DeFi knowledge required.",
  openGraph: {
    title: "NeuroWealth — AI-Powered Yield on Stellar",
    description:
      "Autonomous AI yield optimization on Stellar. Set it and forget it.",
    type: "website",
    url: "https://neurowealth.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroWealth — AI-Powered Yield on Stellar",
    description:
      "Autonomous AI yield optimization on Stellar. Set it and forget it.",
  },
};

const FeaturesSection = dynamicImport(
  () => import("@/features/landing/FeaturesSection").then((m) => m.FeaturesSection),
  { ssr: true }
);
const HowItWorksSection = dynamicImport(
  () => import("@/features/landing/HowItWorksSection").then((m) => m.HowItWorksSection),
  { ssr: true }
);
const StrategiesSection = dynamicImport(
  () => import("@/features/landing/StrategiesSection").then((m) => m.StrategiesSection),
  { ssr: true }
);
const SecuritySection = dynamicImport(
  () => import("@/features/landing/SecuritySection").then((m) => m.SecuritySection),
  { ssr: true }
);
const CtaSection = dynamicImport(
  () => import("@/features/landing/CtaSection").then((m) => m.CtaSection),
  { ssr: true }
);

export default function Home() {
  return (
    <>
      <Navbar />

      <main id={MAIN_CONTENT_LANDMARK_ID} tabIndex={-1}>
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
