import React, { Suspense } from "react";
import { PreObservationForm } from "@/features/pre-observation/PreObservationForm";

export default function PraObservasiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-muted">Memuat formulir pra-observasi...</div>}>
      <PreObservationForm />
    </Suspense>
  );
}
