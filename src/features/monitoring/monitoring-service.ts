// Layanan komputasi monitoring dan evaluasi perkembangan guru (Sheet 8 & 9 SSOT)

import { Teacher, Observation } from "@/contracts/schemas";
import { AspectCode, SupervisionStatus, Trend, TargetStatus } from "@/contracts/enums";
import {
  calculateProgressAndTrend,
  evaluateTargetStatus,
  determineSupervisionStatus,
} from "@/domain/scoring";
import { TeacherService } from "../teachers/teacher-service";
import { ObservationService } from "../observation/observation-service";
import { FollowupService } from "../followup/followup-service";
import { SettingsService } from "../settings/settings-service";

export interface TeacherMonitoringSummary {
  teacher: Teacher;
  target_skor: number;
  total_sesi: number;
  min_sesi_wajib: number;
  sesi_selesai: boolean;
  status_supervisi: SupervisionStatus;

  // Riwayat Sesi Observasi (Sesi 1, 2, 3)
  sesi_1: { skor: number; persentase: number; predikat: string; tanggal: string } | null;
  sesi_2: { skor: number; persentase: number; predikat: string; tanggal: string } | null;
  sesi_3: { skor: number; persentase: number; predikat: string; tanggal: string } | null;

  // Analisis Tren & Target (BR-07 & BR-08)
  skor_terbaru: number | null;
  persentase_terbaru: number | null;
  predikat_terbaru: string | null;
  perkembangan_poin: number | null;
  tren: Trend | "Belum Ada Data";
  status_target: TargetStatus;
  selisih_target: number | null; // persentase - target

  // Analisis Aspek Rubrik
  rata_aspek: Partial<Record<AspectCode, number | null>> | null;
  aspek_tertinggi: string | null;
  aspek_prioritas: string[]; // Kode aspek yang menjadi prioritas atau di bawah 3.0

  // Status RTL
  total_rtl: number;
  rtl_selesai: number;
  rtl_berjalan: number;
  rtl_overdue: number;
}

export const MonitoringService = {
  /**
   * Menghasilkan ringkasan komprehensif seluruh guru untuk Sheet 8 & Sheet 9
   */
  getAllTeacherSummaries(): TeacherMonitoringSummary[] {
    const teachers = TeacherService.getTeachers();
    const allObservations = ObservationService.getObservations();
    const allFollowups = FollowupService.getFollowups();
    const gradingSettings = SettingsService.getGradingSettings();

    return teachers.map((teacher) => {
      // Ambil observasi milik guru ini yang sudah Final
      const teacherObs = allObservations
        .filter((o) => o.teacher_id === teacher.id && o.status === "Final")
        .sort((a, b) => new Date(a.tanggal_observasi).getTime() - new Date(b.tanggal_observasi).getTime());

      const teacherDrafts = allObservations.filter(
        (o) => o.teacher_id === teacher.id && o.status === "Draf"
      );

      const teacherFollowups = allFollowups.filter((f) => f.teacher_id === teacher.id);
      const minSesiWajib = TeacherService.getRequiredFrequency(teacher);

      // Ambil hingga 3 sesi
      const s1 = teacherObs[0] || null;
      const s2 = teacherObs[1] || null;
      const s3 = teacherObs[2] || null;

      const formatSesi = (obs: Observation | null) => {
        if (!obs) return null;
        const scores = ObservationService.getAllScores(obs.id);
        const res = ObservationService.calculateObservationMetrics(scores);
        if (res.totalScore === null || res.percentage === null || !res.predikat) return null;
        return {
          skor: res.totalScore,
          persentase: res.percentage,
          predikat: res.predikat,
          tanggal: obs.tanggal_observasi,
        };
      };

      const sesi1Data = formatSesi(s1);
      const sesi2Data = formatSesi(s2);
      const sesi3Data = formatSesi(s3);

      // Evaluasi Tren dari 2 sesi observasi (sesi 1 awal dan sesi terbaru)
      const validSessions = [sesi1Data, sesi2Data, sesi3Data].filter(Boolean);
      const firstScore = validSessions.length > 1 ? validSessions[0]!.persentase : null;
      const latestScore = validSessions.length > 0 ? validSessions[validSessions.length - 1]!.persentase : null;

      const { progress, trend } = calculateProgressAndTrend(
        firstScore,
        latestScore,
        gradingSettings.toleransi_tren_stagnan
      );

      // Evaluasi Target
      const targetScore = gradingSettings.target_default;
      const statusTarget = evaluateTargetStatus(latestScore, targetScore, gradingSettings.target_default);
      const selisihTarget = latestScore !== null ? Number((latestScore - targetScore).toFixed(1)) : null;

      // Status Supervisi
      const statusSupervisi = determineSupervisionStatus({
        hasCompletedObservation: teacherObs.length > 0,
        hasFollowup: teacherFollowups.length > 0,
        hasPreObservation: false,
        hasDraftObservation: teacherDrafts.length > 0,
      });

      // Analisis Aspek dari observasi terbaru
      let rataAspek: Partial<Record<AspectCode, number | null>> | null = null;
      const aspekPrioritas: string[] = [];
      let aspekTertinggi: string | null = null;

      if (teacherObs.length > 0) {
        const latestObs = teacherObs[teacherObs.length - 1];
        const scores = ObservationService.getAllScores(latestObs.id);
        const calcRes = ObservationService.calculateObservationMetrics(scores);

        rataAspek = calcRes.aspectAverages;
        if (calcRes.priorityAspect) {
          aspekPrioritas.push(`Aspek ${calcRes.priorityAspect}`);
        }

        // Cari aspek dengan nilai tertinggi
        const aspectLabels: Record<string, string> = {
          A: "Perencanaan",
          B: "Pelaksanaan",
          C: "Penilaian",
          D: "Karakter",
          E: "Iklim Kelas",
          F: "Refleksi",
          G: "Tindak Lanjut",
        };

        let highestVal = -1;
        let highestKey = "";
        if (rataAspek) {
          (Object.entries(rataAspek) as [string, number | null][]).forEach(([key, val]) => {
            if (typeof val === "number" && val > highestVal) {
              highestVal = val;
              highestKey = key;
            }
          });
        }

        if (highestKey) {
          aspekTertinggi = `${aspectLabels[highestKey] || highestKey} (${highestVal.toFixed(2)})`;
        }
      }

      // Hitung RTL
      const totalRtl = teacherFollowups.length;
      const rtlSelesai = teacherFollowups.filter((f) => f.status === "Selesai").length;
      const rtlBerjalan = teacherFollowups.filter((f) => f.status === "Berjalan").length;
      const rtlOverdue = teacherFollowups.filter((f) => FollowupService.isOverdue(f)).length;

      const latestSesiData = validSessions.length > 0 ? validSessions[validSessions.length - 1] : null;

      return {
        teacher,
        target_skor: targetScore,
        total_sesi: teacherObs.length,
        min_sesi_wajib: minSesiWajib,
        sesi_selesai: teacherObs.length >= minSesiWajib,
        status_supervisi: statusSupervisi,
        sesi_1: sesi1Data,
        sesi_2: sesi2Data,
        sesi_3: sesi3Data,
        skor_terbaru: latestSesiData ? latestSesiData.skor : null,
        persentase_terbaru: latestSesiData ? latestSesiData.persentase : null,
        predikat_terbaru: latestSesiData ? latestSesiData.predikat : null,
        perkembangan_poin: progress,
        tren: trend ?? "Belum Ada Data",
        status_target: statusTarget,
        selisih_target: selisihTarget,
        rata_aspek: rataAspek,
        aspek_tertinggi: aspekTertinggi,
        aspek_prioritas: aspekPrioritas,
        total_rtl: totalRtl,
        rtl_selesai: rtlSelesai,
        rtl_berjalan: rtlBerjalan,
        rtl_overdue: rtlOverdue,
      };
    });
  },

  /**
   * Mengambil summary monitoring untuk 1 guru spesifik
   */
  getTeacherSummary(teacherId: string): TeacherMonitoringSummary | undefined {
    return this.getAllTeacherSummaries().find((s) => s.teacher.id === teacherId);
  },
};
