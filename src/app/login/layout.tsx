import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your NeuroWealth account to manage your AI-powered yield strategy.",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
