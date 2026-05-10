"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["partner"]}>
      {children}
    </ProtectedRoute>
  );
}
