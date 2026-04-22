import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  isCurrentPage?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  theme?: "light" | "dark";
  className?: string;
}

export interface RouteMetadata extends BreadcrumbItem {}
