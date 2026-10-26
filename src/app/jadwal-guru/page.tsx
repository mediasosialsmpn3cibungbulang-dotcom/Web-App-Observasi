import { TeachingScheduleManager } from "@/features/teaching-schedules/TeachingScheduleManager";

export const metadata = {
  title: "Jadwal Mengajar Guru - Sistem Supervisi Guru",
  description: "Manajemen jadwal pelajaran dan jam mengajar mingguan guru resmi aSc Timetables SMPN 3 Cibungbulang",
};

export default function JadwalGuruPage() {
  return <TeachingScheduleManager />;
}