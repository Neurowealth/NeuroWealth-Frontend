import { FileQuestion } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

/**
 * Not-found handler for dashboard sub-routes.
 * Handles requests to invalid or deleted dashboard pages like /dashboard/invalid-page
 */
export default function DashboardNotFound() {
  return (
    <ErrorPage
      statusCode={404}
      title="Dashboard page not found"
      description="The dashboard page you're looking for doesn't exist or has been removed. Try navigating using the menu or go back to the main dashboard."
      icon={<FileQuestion size={32} />}
      primaryAction={{ label: "Back to dashboard", href: "/dashboard" }}
      secondaryAction={{ label: "Go to portfolio", href: "/dashboard/portfolio" }}
      ownsLandmark={false}
    />
  );
}
