import { AuditTrail } from "@/components/audit/AuditTrail";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { Suspense } from "react";
import { AuditTableSkeleton } from "@/components/ui/Skeleton";

export default function AuditPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <Suspense fallback={<AuditTableSkeleton rows={6} />}>
        <AuditTrail />
      </Suspense>
    </ProtectedRoute>
  );
}
