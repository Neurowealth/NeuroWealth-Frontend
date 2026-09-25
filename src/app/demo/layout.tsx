import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const DEMO_ENABLED_IN_PRODUCTION =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_ROUTES === "true";

const CAN_ACCESS_DEMO =
  process.env.NODE_ENV !== "production" || DEMO_ENABLED_IN_PRODUCTION;

export default function DemoLayout({ children }: { children: ReactNode }) {
  if (!CAN_ACCESS_DEMO) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
