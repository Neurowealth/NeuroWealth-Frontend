import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  title?: string;
}

export function Spinner({ className = "h-4 w-4", title = "Loading" }: SpinnerProps) {
  return <Loader2 className={"animate-spin " + className} aria-label={title} role="status" />;
}