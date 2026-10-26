import React, { Suspense } from "react";
import { CoachingSessionView } from "@/features/coaching/CoachingSessionView";

export default function CoachingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Memuat percakapan pasca-observasi & coaching...</div>}>
      <CoachingSessionView />
    </Suspense>
  );
}
