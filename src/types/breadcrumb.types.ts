import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  isCurrentPage?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxItems?: number; // max visible before collapsing (default: 4)
  theme?: 'light' | 'dark';
  className?: string;
}

export interface RouteMetadata {
  label: string;
  icon?: ReactNode;
  href: string;
}
