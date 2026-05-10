"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function LearnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["learner"]}>
      {children}
    </ProtectedRoute>
  );
}
