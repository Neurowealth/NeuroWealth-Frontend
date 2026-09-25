import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your NeuroWealth account and start earning automated yield on Stellar.",
  robots: { index: false, follow: false },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
