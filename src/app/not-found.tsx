"use client";

import { FileQuestion } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { useI18n } from "@/contexts/I18nContext";

export default function NotFound() {
  const { messages } = useI18n();
  const m = messages.notFound;

  return (
    <ErrorPage
      statusCode={404}
      title={m.title}
      description={m.description}
      icon={<FileQuestion size={32} />}
      primaryAction={{ label: m.primaryAction, href: "/" }}
      secondaryAction={{ label: m.secondaryAction, href: "/dashboard" }}
    />
  );
}
