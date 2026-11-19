"use client";

import { Lock } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { useI18n } from "@/contexts/I18nContext";

export const dynamic = "force-dynamic";

export default function UnauthorizedPage() {
  const { messages } = useI18n();
  const t = messages.errors.unauthorized;

  return (
    <ErrorPage
      statusCode={401}
      title={t.title}
      description={t.description}
      icon={<Lock size={32} />}
      primaryAction={{ label: t.signIn, href: "/login" }}
      secondaryAction={{ label: t.backToHome, href: "/" }}
    />
  );
}
