import { ServerCrash } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

export const dynamic = "force-dynamic";

export default function ServerErrorPage() {
  return (
    <ErrorPage
      statusCode={500}
      title="Something went wrong"
      description="We ran into an unexpected server error. Your account and funds remain safe. Try again or return home while we look into it."
      icon={<ServerCrash size={32} />}
      primaryAction={{ label: "Back to home", href: "/" }}
      secondaryAction={{ label: "Go to dashboard", href: "/dashboard" }}
    />
  );
}
