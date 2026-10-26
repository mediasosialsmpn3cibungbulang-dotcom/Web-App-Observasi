"use client";

import React, { Suspense } from "react";
import { ObservationSession } from "@/features/observation/ObservationSession";

export default function ObservasiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Memuat instrumen observasi kelas...</div>}>
      <ObservationSession />
    </Suspense>
  );
}
