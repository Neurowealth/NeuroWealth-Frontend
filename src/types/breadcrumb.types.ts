export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
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
  icon?: React.ReactNode;
  href: string;
}