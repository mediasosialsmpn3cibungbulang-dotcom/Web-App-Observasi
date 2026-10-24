"use client";

import React, { useState } from "react";
import { Users, Target } from "lucide-react";
import { TeacherList } from "@/features/teachers/TeacherList";
import { TeacherMonitoringView } from "@/features/monitoring/TeacherMonitoringView";

export default function GuruPage() {
  const [activeTab, setActiveTab] = useState<"direktori" | "monitoring">("direktori");

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-border gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("direktori")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "direktori"
              ? "border-pine-600 text-pine-700 dark:border-pine-400 dark:text-pine-300"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Users className="w-4 h-4" />
          Direktori Guru & Data Pokok
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("monitoring")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "monitoring"
              ? "border-pine-600 text-pine-700 dark:border-pine-400 dark:text-pine-300"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Target className="w-4 h-4" />
          Target, Tren & Evaluasi (Sheet 8-9)
        </button>
      </div>

      {/* Konten Tab Aktif */}
      {activeTab === "direktori" ? <TeacherList /> : <TeacherMonitoringView />}
    </div>
  );
}
