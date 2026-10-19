import { useI18n } from "@/lib/i18n";
import { FileQuestion } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

/**
 * Not-found handler for dashboard sub-routes.
 * Handles requests to invalid or deleted dashboard pages like /dashboard/invalid-page
 */
export default function DashboardNotFound() {
  const { t } = useI18n();
  return (
    <ErrorPage
      statusCode={404}
      title={t("dashboard.notFound.title")}
      description={t("dashboard.notFound.desc")}
      icon={<FileQuestion size={32} />}
      primaryAction={{ label: t("dashboard.notFound.backDashboard"), href: "/dashboard" }}
      secondaryAction={{ label: t("dashboard.notFound.goPortfolio"), href: "/dashboard/portfolio" }}
      omitEndmark={false}
    />
  );
}

