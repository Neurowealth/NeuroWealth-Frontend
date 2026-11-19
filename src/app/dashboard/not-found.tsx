"use client";

import { FileQuestion } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { useI18n } from "@/contexts/I18nContext";

/**
 * Not-found handler for dashboard sub-routes.
 * Handles requests to invalid or deleted dashboard pages like /dashboard/invalid-page
 */
export default function DashboardNotFound() {
  const { messages } = useI18n();
  const t = messages.errors.notFound;

  return (
    <ErrorPage
      statusCode={404}
      title={t.title}
      description={t.description}
      icon={<FileQuestion size={32} />}
      primaryAction={{ label: t.backToDashboard, href: "/dashboard" }}
      secondaryAction={{ label: t.goToPortfolio, href: "/dashboard/portfolio" }}
      ownsLandmark={false}
    />
  );
}
