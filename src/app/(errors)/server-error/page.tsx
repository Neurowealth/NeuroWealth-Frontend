"use client";

import { ServerCrash } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { useI18n } from "@/contexts/I18nContext";

export const dynamic = "force-dynamic";

export default function ServerErrorPage() {
  const { messages } = useI18n();
  const t = messages.errors.serverError;

  return (
    <ErrorPage
      statusCode={500}
      title={t.title}
      description={t.description}
      icon={<ServerCrash size={32} />}
      primaryAction={{ label: t.backToHome, href: "/" }}
      secondaryAction={{ label: t.goToDashboard, href: "/dashboard" }}
    />
  );
}
