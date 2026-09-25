import { redirect } from "next/navigation";
import SandboxClientPage from "./SandboxClientPage";

export const dynamic = "force-dynamic";

const SANDBOX_ENABLED_IN_PRODUCTION =
  process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX === "true";

const CAN_ACCESS_SANDBOX =
  process.env.NODE_ENV !== "production" || SANDBOX_ENABLED_IN_PRODUCTION;

export default function SandboxPage() {
  if (!CAN_ACCESS_SANDBOX) {
    redirect("/dashboard");
  }

  return <SandboxClientPage />;
}
