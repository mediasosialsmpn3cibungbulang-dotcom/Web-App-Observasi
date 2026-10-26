export type DayName = "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat";

export interface TeachingSlot {
  id: string;
  hari: DayName;
  jam_ke?: string;
  waktu: string;
  kelas: string;
  mata_pelajaran: string;
}

export interface TeacherSchedule {
  teacher_id: string;
  nama_lengkap: string;
  slots: TeachingSlot[];
}

export const TEACHER_SCHEDULES: Record<string, TeacherSchedule> = {
  // 1. Lilis Yuliati, M.Pd (IPA)
  "a2222222-2222-2222-2222-222222222222": {
    teacher_id: "a2222222-2222-2222-2222-222222222222",
    nama_lengkap: "Lilis Yuliati, M.Pd",
    slots: [
      { id: "ly-1", hari: "Senin", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:10", kelas: "8D", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-2", hari: "Senin", jam_ke: "Jam Ke 4-5", waktu: "10:10 - 11:20", kelas: "8E", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-3", hari: "Senin", jam_ke: "Jam Ke 6", waktu: "11:20 - 11:55", kelas: "8A", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-4", hari: "Selasa", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 12:00", kelas: "8F", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-5", hari: "Selasa", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "8C", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-6", hari: "Rabu", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 09:15", kelas: "8B", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-7", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8C", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-8", hari: "Kamis", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "8F", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-9", hari: "Kamis", jam_ke: "Jam Ke 3-5", waktu: "09:15 - 11:25", kelas: "8A", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-10", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8D", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-11", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:00", kelas: "8B", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "ly-12", hari: "Jumat", jam_ke: "Jam Ke 3-4", waktu: "09:00 - 10:50", kelas: "8E", mata_pelajaran: "Ilmu Pengetahuan Alam" },
    ],
  },

  // 2. Aini Supiyah, S.Pd, MM (IPS)
  "a1111111-1111-1111-1111-111111111111": {
    teacher_id: "a1111111-1111-1111-1111-111111111111",
    nama_lengkap: "Aini Supiyah, S.Pd, MM",
    slots: [
      { id: "as-1", hari: "Senin", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:10", kelas: "8G", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-2", hari: "Senin", jam_ke: "Jam Ke 4-5", waktu: "10:10 - 11:20", kelas: "9F", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-3", hari: "Senin", jam_ke: "Jam Ke 6-7", waktu: "11:20 - 13:20", kelas: "9G", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-4", hari: "Senin", jam_ke: "Jam Ke 8-9", waktu: "13:20 - 14:30", kelas: "9B", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-5", hari: "Selasa", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "8G", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-6", hari: "Selasa", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "9C", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-7", hari: "Selasa", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "9A", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-8", hari: "Rabu", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "9B", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-9", hari: "Rabu", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "9A", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-10", hari: "Rabu", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "9D", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-11", hari: "Rabu", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "9C", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-12", hari: "Kamis", jam_ke: "Jam Ke 3-4", waktu: "09:15 - 10:50", kelas: "9E", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-13", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "9F", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-14", hari: "Kamis", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "9D", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-15", hari: "Jumat", jam_ke: "Jam Ke 3-4", waktu: "09:00 - 10:20", kelas: "9G", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "as-16", hari: "Jumat", jam_ke: "Jam Ke 5-6", waktu: "10:20 - 11:20", kelas: "9E", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
    ],
  },

  // 3. Hj. Heny Susana, S.Pd (Pendidikan Pancasila)
  "a3333333-3333-3333-3333-333333333333": {
    teacher_id: "a3333333-3333-3333-3333-333333333333",
    nama_lengkap: "Hj. Heny Susana, S.Pd",
    slots: [
      { id: "hs-1", hari: "Senin", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:10", kelas: "7H", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-2", hari: "Senin", jam_ke: "Jam Ke 4-5", waktu: "10:10 - 11:20", kelas: "7C", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-3", hari: "Senin", jam_ke: "Jam Ke 7-8", waktu: "12:45 - 13:55", kelas: "7D", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9A", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-5", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7A", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-6", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7G", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-7", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7E", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-8", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9B", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-9", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7F", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-10", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "7B", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "hs-11", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "9C", mata_pelajaran: "Pendidikan Pancasila" },
    ],
  },

  // 4. Dewi Nurhandayani, S.Pd (Bahasa Inggris)
  "a4444444-4444-4444-4444-444444444444": {
    teacher_id: "a4444444-4444-4444-4444-444444444444",
    nama_lengkap: "Dewi Nurhandayani, S.Pd",
    slots: [
      { id: "dn-1", hari: "Senin", jam_ke: "Jam Ke 4-5", waktu: "10:10 - 11:20", kelas: "8A", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-2", hari: "Senin", jam_ke: "Jam Ke 6-7", waktu: "11:20 - 13:20", kelas: "8G", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-3", hari: "Senin", jam_ke: "Jam Ke 8-9", waktu: "13:20 - 14:30", kelas: "8E", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-4", hari: "Selasa", jam_ke: "Jam Ke 3-4", waktu: "09:15 - 10:50", kelas: "8C", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-5", hari: "Selasa", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "8G", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-6", hari: "Selasa", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "8F", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-7", hari: "Rabu", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "8F", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-8", hari: "Rabu", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "8D", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-9", hari: "Rabu", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 11:25", kelas: "8A", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-10", hari: "Kamis", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "8D", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-11", hari: "Kamis", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "8B", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-12", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "8E", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-13", hari: "Jumat", jam_ke: "Jam Ke 3-4", waktu: "09:00 - 10:20", kelas: "8C", mata_pelajaran: "Bahasa Inggris" },
      { id: "dn-14", hari: "Jumat", jam_ke: "Jam Ke 5-6", waktu: "10:20 - 11:20", kelas: "8B", mata_pelajaran: "Bahasa Inggris" },
    ],
  },

  // 5. Mohamad Reza Septiyani, S.Pd (PJOK)
  "a5555555-5555-5555-5555-555555555555": {
    teacher_id: "a5555555-5555-5555-5555-555555555555",
    nama_lengkap: "Mohamad Reza Septiyani, S.Pd",
    slots: [
      { id: "mr-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "9F", mata_pelajaran: "PJOK" },
      { id: "mr-2", hari: "Senin", jam_ke: "Jam Ke 4-6", waktu: "10:10 - 11:55", kelas: "9E", mata_pelajaran: "PJOK" },
      { id: "mr-3", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "9C", mata_pelajaran: "PJOK" },
      { id: "mr-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9D", mata_pelajaran: "PJOK" },
      { id: "mr-5", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9B", mata_pelajaran: "PJOK" },
      { id: "mr-6", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7C", mata_pelajaran: "PJOK" },
      { id: "mr-7", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9G", mata_pelajaran: "PJOK" },
      { id: "mr-8", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7D", mata_pelajaran: "PJOK" },
      { id: "mr-9", hari: "Kamis", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9A", mata_pelajaran: "PJOK" },
      { id: "mr-10", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "7A", mata_pelajaran: "PJOK" },
      { id: "mr-11", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "7B", mata_pelajaran: "PJOK" },
    ],
  },

  // 6. Wilda Fajaratu Rahmi A, S.Pd (Bahasa Indonesia)
  "b0000001-0000-0000-0000-000000000006": {
    teacher_id: "b0000001-0000-0000-0000-000000000006",
    nama_lengkap: "Wilda Fajaratu Rahmi A, S.Pd",
    slots: [
      { id: "wf-1", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "7E", mata_pelajaran: "Bahasa Indonesia" },
      { id: "wf-2", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7D", mata_pelajaran: "Bahasa Indonesia" },
      { id: "wf-3", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "7C", mata_pelajaran: "Bahasa Indonesia" },
      { id: "wf-4", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7B", mata_pelajaran: "Bahasa Indonesia" },
      { id: "wf-5", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7A", mata_pelajaran: "Bahasa Indonesia" },
      { id: "wf-6", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7D", mata_pelajaran: "Bahasa Indonesia" },
      { id: "wf-7", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7A", mata_pelajaran: "Bahasa Indonesia" },
      { id: "wf-8", hari: "Kamis", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "7E", mata_pelajaran: "Bahasa Indonesia" },
      { id: "wf-9", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7B", mata_pelajaran: "Bahasa Indonesia" },
      { id: "wf-10", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "7C", mata_pelajaran: "Bahasa Indonesia" },
    ],
  },

  // 7. Nika Musrifah, S.Pd (Bimbingan & Konseling)
  "b0000001-0000-0000-0000-000000000007": {
    teacher_id: "b0000001-0000-0000-0000-000000000007",
    nama_lengkap: "Nika Musrifah, S.Pd",
    slots: [
      { id: "nm-1", hari: "Senin", jam_ke: "Jam Ke 3", waktu: "09:10 - 09:45", kelas: "9A", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-2", hari: "Senin", jam_ke: "Jam Ke 5", waktu: "10:45 - 11:20", kelas: "7G", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-3", hari: "Senin", jam_ke: "Jam Ke 6", waktu: "11:20 - 11:55", kelas: "9D", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-4", hari: "Senin", jam_ke: "Jam Ke 7", waktu: "12:45 - 13:20", kelas: "7C", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-5", hari: "Selasa", jam_ke: "Jam Ke 1", waktu: "07:30 - 08:05", kelas: "8F", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-6", hari: "Selasa", jam_ke: "Jam Ke 3", waktu: "09:15 - 09:50", kelas: "9G", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-7", hari: "Selasa", jam_ke: "Jam Ke 5", waktu: "10:50 - 11:25", kelas: "7A", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-8", hari: "Selasa", jam_ke: "Jam Ke 6", waktu: "11:25 - 12:00", kelas: "7F", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-9", hari: "Selasa", jam_ke: "Jam Ke 8", waktu: "13:35 - 14:10", kelas: "9C", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-10", hari: "Rabu", jam_ke: "Jam Ke 1", waktu: "07:30 - 08:05", kelas: "8A", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-11", hari: "Rabu", jam_ke: "Jam Ke 3", waktu: "08:40 - 09:15", kelas: "9E", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-12", hari: "Rabu", jam_ke: "Jam Ke 5", waktu: "10:50 - 11:25", kelas: "7D", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-13", hari: "Rabu", jam_ke: "Jam Ke 6", waktu: "11:25 - 12:00", kelas: "7B", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-14", hari: "Rabu", jam_ke: "Jam Ke 8", waktu: "13:35 - 14:10", kelas: "8B", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-15", hari: "Kamis", jam_ke: "Jam Ke 1", waktu: "07:30 - 08:05", kelas: "8C", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-16", hari: "Kamis", jam_ke: "Jam Ke 3", waktu: "08:40 - 09:15", kelas: "8D", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-17", hari: "Kamis", jam_ke: "Jam Ke 5", waktu: "10:50 - 11:25", kelas: "8G", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-18", hari: "Kamis", jam_ke: "Jam Ke 6", waktu: "11:25 - 12:00", kelas: "7E", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-19", hari: "Kamis", jam_ke: "Jam Ke 8", waktu: "13:35 - 14:10", kelas: "9B", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-20", hari: "Jumat", jam_ke: "Jam Ke 1", waktu: "08:00 - 08:30", kelas: "7H", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-21", hari: "Jumat", jam_ke: "Jam Ke 4", waktu: "09:50 - 10:20", kelas: "9F", mata_pelajaran: "Bimbingan & Konseling" },
      { id: "nm-22", hari: "Jumat", jam_ke: "Jam Ke 5", waktu: "10:50 - 11:20", kelas: "8E", mata_pelajaran: "Bimbingan & Konseling" },
    ],
  },

  // 8. Wiwin Djueriah, S.Pd, M.Han (Matematika)
  "b0000001-0000-0000-0000-000000000008": {
    teacher_id: "b0000001-0000-0000-0000-000000000008",
    nama_lengkap: "Wiwin Djueriah, S.Pd, M.Han",
    slots: [
      { id: "wd-1", hari: "Senin", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:10", kelas: "9C", mata_pelajaran: "Matematika" },
      { id: "wd-2", hari: "Senin", jam_ke: "Jam Ke 4-5", waktu: "10:10 - 11:20", kelas: "9B", mata_pelajaran: "Matematika" },
      { id: "wd-3", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "9A", mata_pelajaran: "Matematika" },
      { id: "wd-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9B", mata_pelajaran: "Matematika" },
      { id: "wd-5", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9F", mata_pelajaran: "Matematika" },
      { id: "wd-6", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9E", mata_pelajaran: "Matematika" },
      { id: "wd-7", hari: "Rabu", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "9E", mata_pelajaran: "Matematika" },
      { id: "wd-8", hari: "Rabu", jam_ke: "Jam Ke 3-4", waktu: "09:15 - 10:50", kelas: "9D", mata_pelajaran: "Matematika" },
      { id: "wd-9", hari: "Rabu", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "9C", mata_pelajaran: "Matematika" },
      { id: "wd-10", hari: "Rabu", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "9A", mata_pelajaran: "Matematika" },
      { id: "wd-11", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9G", mata_pelajaran: "Matematika" },
      { id: "wd-12", hari: "Kamis", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "9F", mata_pelajaran: "Matematika" },
      { id: "wd-13", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "9D", mata_pelajaran: "Matematika" },
      { id: "wd-14", hari: "Jumat", jam_ke: "Jam Ke 5-6", waktu: "10:20 - 11:20", kelas: "9G", mata_pelajaran: "Matematika" },
    ],
  },

  // 9. Reza Kusnendar, S.Pd (Matematika)
  "b0000001-0000-0000-0000-000000000009": {
    teacher_id: "b0000001-0000-0000-0000-000000000009",
    nama_lengkap: "Reza Kusnendar, S.Pd",
    slots: [
      { id: "rk-1", hari: "Senin", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:10", kelas: "7B", mata_pelajaran: "Matematika" },
      { id: "rk-2", hari: "Senin", jam_ke: "Jam Ke 8-9", waktu: "13:20 - 14:30", kelas: "7G", mata_pelajaran: "Matematika" },
      { id: "rk-3", hari: "Selasa", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "7E", mata_pelajaran: "Matematika" },
      { id: "rk-4", hari: "Selasa", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 10:50", kelas: "7A", mata_pelajaran: "Matematika" },
      { id: "rk-5", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7D", mata_pelajaran: "Matematika" },
      { id: "rk-6", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7E", mata_pelajaran: "Matematika" },
      { id: "rk-7", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 10:50", kelas: "7C", mata_pelajaran: "Matematika" },
      { id: "rk-8", hari: "Rabu", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7B", mata_pelajaran: "Matematika" },
      { id: "rk-9", hari: "Kamis", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "7F", mata_pelajaran: "Matematika" },
      { id: "rk-10", hari: "Kamis", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 10:50", kelas: "7C", mata_pelajaran: "Matematika" },
      { id: "rk-11", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "7A", mata_pelajaran: "Matematika" },
      { id: "rk-12", hari: "Kamis", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7D", mata_pelajaran: "Matematika" },
      { id: "rk-13", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "7F", mata_pelajaran: "Matematika" },
      { id: "rk-14", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "7G", mata_pelajaran: "Matematika" },
    ],
  },

  // 10. Acip Sulaeman, S.Pd I (PAIBP / IPS)
  "b0000001-0000-0000-0000-000000000010": {
    teacher_id: "b0000001-0000-0000-0000-000000000010",
    nama_lengkap: "Acip Sulaeman, S.Pd I",
    slots: [
      { id: "ac-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "9B", mata_pelajaran: "PAIBP" },
      { id: "ac-2", hari: "Senin", jam_ke: "Jam Ke 6-7", waktu: "11:20 - 13:20", kelas: "7B", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "ac-3", hari: "Senin", jam_ke: "Jam Ke 8-9", waktu: "13:20 - 14:30", kelas: "7C", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "ac-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9F", mata_pelajaran: "PAIBP" },
      { id: "ac-5", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9E", mata_pelajaran: "PAIBP" },
      { id: "ac-6", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9G", mata_pelajaran: "PAIBP" },
      { id: "ac-7", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9D", mata_pelajaran: "PAIBP" },
      { id: "ac-8", hari: "Rabu", jam_ke: "Jam Ke 4-6", waktu: "10:15 - 12:00", kelas: "9A", mata_pelajaran: "PAIBP" },
      { id: "ac-9", hari: "Rabu", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7A", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "ac-10", hari: "Kamis", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "7B", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "ac-11", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "7C", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "ac-12", hari: "Kamis", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7A", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "ac-13", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "9C", mata_pelajaran: "PAIBP" },
    ],
  },

  // 11. Awaliyatussa'dah M, S.Pd.I (PAIBP / Bahasa Sunda)
  "b0000001-0000-0000-0000-000000000011": {
    teacher_id: "b0000001-0000-0000-0000-000000000011",
    nama_lengkap: "Awaliyatussa'dah M, S.Pd.I",
    slots: [
      { id: "aw-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "7F", mata_pelajaran: "PAIBP" },
      { id: "aw-2", hari: "Senin", jam_ke: "Jam Ke 4-6", waktu: "10:10 - 11:55", kelas: "7A", mata_pelajaran: "PAIBP" },
      { id: "aw-3", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7C", mata_pelajaran: "PAIBP" },
      { id: "aw-4", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 10:50", kelas: "9A", mata_pelajaran: "Bahasa Sunda" },
      { id: "aw-5", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 13:35", kelas: "9C", mata_pelajaran: "Bahasa Sunda" },
      { id: "aw-6", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7D", mata_pelajaran: "PAIBP" },
      { id: "aw-7", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "7B", mata_pelajaran: "PAIBP" },
      { id: "aw-8", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7E", mata_pelajaran: "PAIBP" },
      { id: "aw-9", hari: "Kamis", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "7G", mata_pelajaran: "PAIBP" },
      { id: "aw-10", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 13:35", kelas: "9B", mata_pelajaran: "Bahasa Sunda" },
      { id: "aw-11", hari: "Jumat", jam_ke: "Jam Ke 2-4", waktu: "08:30 - 10:20", kelas: "7H", mata_pelajaran: "PAIBP" },
    ],
  },

  // 12. Saherudin, S.Pd (IPS)
  "b0000001-0000-0000-0000-000000000012": {
    teacher_id: "b0000001-0000-0000-0000-000000000012",
    nama_lengkap: "Saherudin, S.Pd",
    slots: [
      { id: "sh-1", hari: "Senin", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:10", kelas: "7G", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-2", hari: "Senin", jam_ke: "Jam Ke 3-4", waktu: "09:10 - 10:45", kelas: "8D", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-3", hari: "Senin", jam_ke: "Jam Ke 8-9", waktu: "13:20 - 14:30", kelas: "8A", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-4", hari: "Selasa", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "7G", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-5", hari: "Selasa", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "8C", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-6", hari: "Selasa", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7H", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-7", hari: "Rabu", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "8D", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-8", hari: "Rabu", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "7H", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-9", hari: "Rabu", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 11:25", kelas: "8F", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-10", hari: "Rabu", jam_ke: "Jam Ke 7-8", waktu: "11:25 - 13:35", kelas: "8B", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-11", hari: "Kamis", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "8E", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-12", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 11:25", kelas: "8B", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-13", hari: "Kamis", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "8F", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-14", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:00", kelas: "8E", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-15", hari: "Jumat", jam_ke: "Jam Ke 3-4", waktu: "09:00 - 10:20", kelas: "8A", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "sh-16", hari: "Jumat", jam_ke: "Jam Ke 5-6", waktu: "10:20 - 11:20", kelas: "8C", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
    ],
  },

  // 13. Anwar Sanusi, M.Pd (Bahasa Indonesia)
  "b0000001-0000-0000-0000-000000000013": {
    teacher_id: "b0000001-0000-0000-0000-000000000013",
    nama_lengkap: "Anwar Sanusi, M.Pd",
    slots: [
      { id: "as-b1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "9E", mata_pelajaran: "Bahasa Indonesia" },
      { id: "as-b2", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9E", mata_pelajaran: "Bahasa Indonesia" },
      { id: "as-b3", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9D", mata_pelajaran: "Bahasa Indonesia" },
      { id: "as-b4", hari: "Rabu", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 10:50", kelas: "9C", mata_pelajaran: "Bahasa Indonesia" },
      { id: "as-b5", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9B", mata_pelajaran: "Bahasa Indonesia" },
      { id: "as-b6", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9D", mata_pelajaran: "Bahasa Indonesia" },
      { id: "as-b7", hari: "Kamis", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9C", mata_pelajaran: "Bahasa Indonesia" },
      { id: "as-b8", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9A", mata_pelajaran: "Bahasa Indonesia" },
      { id: "as-b9", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "9A", mata_pelajaran: "Bahasa Indonesia" },
      { id: "as-b10", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "9B", mata_pelajaran: "Bahasa Indonesia" },
    ],
  },

  // 14. Siti Mariam Ulfah, S.Pd (Bahasa Indonesia)
  "b0000001-0000-0000-0000-000000000014": {
    teacher_id: "b0000001-0000-0000-0000-000000000014",
    nama_lengkap: "Siti Mariam Ulfah, S.Pd",
    slots: [
      { id: "sm-1", hari: "Senin", jam_ke: "Jam Ke 4-6", waktu: "10:10 - 11:55", kelas: "7H", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-2", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "7F", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-3", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7H", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-4", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "7F", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-5", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8E", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-6", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "8E", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-7", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "8G", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-8", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7G", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-9", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7G", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-10", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 12:00", kelas: "8F", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-11", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "8G", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm-12", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "8F", mata_pelajaran: "Bahasa Indonesia" },
    ],
  },

  // 15. Iip Latifah, S.Pd.I (Prakarya / PAIBP)
  "b0000001-0000-0000-0000-000000000015": {
    teacher_id: "b0000001-0000-0000-0000-000000000015",
    nama_lengkap: "Iip Latifah, S.Pd.I",
    slots: [
      { id: "il-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "7E", mata_pelajaran: "Prakarya" },
      { id: "il-2", hari: "Senin", jam_ke: "Jam Ke 4-6", waktu: "10:10 - 11:55", kelas: "7F", mata_pelajaran: "Prakarya" },
      { id: "il-3", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "7H", mata_pelajaran: "Prakarya" },
      { id: "il-4", hari: "Selasa", jam_ke: "Jam Ke 2-3", waktu: "08:05 - 09:50", kelas: "8F", mata_pelajaran: "PAIBP" },
      { id: "il-5", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7G", mata_pelajaran: "Prakarya" },
      { id: "il-6", hari: "Rabu", jam_ke: "Jam Ke 2-3", waktu: "08:05 - 09:50", kelas: "8A", mata_pelajaran: "PAIBP" },
      { id: "il-7", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8E", mata_pelajaran: "PAIBP" },
      { id: "il-8", hari: "Kamis", jam_ke: "Jam Ke 2-3", waktu: "08:05 - 09:50", kelas: "8C", mata_pelajaran: "PAIBP" },
      { id: "il-9", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8B", mata_pelajaran: "PAIBP" },
      { id: "il-10", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "8D", mata_pelajaran: "PAIBP" },
      { id: "il-11", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "8G", mata_pelajaran: "PAIBP" },
    ],
  },

  // 16. Adam Yahya, S.Pd (PJOK)
  "b0000001-0000-0000-0000-000000000016": {
    teacher_id: "b0000001-0000-0000-0000-000000000016",
    nama_lengkap: "Adam Yahya, S.Pd",
    slots: [
      { id: "ay-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "8C", mata_pelajaran: "PJOK" },
      { id: "ay-2", hari: "Senin", jam_ke: "Jam Ke 4-6", waktu: "10:10 - 11:55", kelas: "8B", mata_pelajaran: "PJOK" },
      { id: "ay-3", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "8D", mata_pelajaran: "PJOK" },
      { id: "ay-4", hari: "Selasa", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 10:50", kelas: "8G", mata_pelajaran: "PJOK" },
      { id: "ay-5", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7E", mata_pelajaran: "PJOK" },
      { id: "ay-6", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "7G", mata_pelajaran: "PJOK" },
      { id: "ay-7", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8A", mata_pelajaran: "PJOK" },
      { id: "ay-8", hari: "Kamis", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 10:50", kelas: "8E", mata_pelajaran: "PJOK" },
      { id: "ay-9", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7H", mata_pelajaran: "PJOK" },
      { id: "ay-10", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "8F", mata_pelajaran: "PJOK" },
      { id: "ay-11", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "7F", mata_pelajaran: "PJOK" },
    ],
  },

  // 17. Siti Maesaroh, S.Pd (Bahasa Indonesia)
  "b0000001-0000-0000-0000-000000000017": {
    teacher_id: "b0000001-0000-0000-0000-000000000017",
    nama_lengkap: "Siti Maesaroh, S.Pd",
    slots: [
      { id: "sm2-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "8A", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-2", hari: "Senin", jam_ke: "Jam Ke 4-6", waktu: "10:10 - 11:55", kelas: "8C", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-3", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "8B", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-4", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "8D", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-5", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8B", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-6", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "8C", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-7", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9F", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-8", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9G", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-9", hari: "Kamis", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9G", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-10", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8A", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-11", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "9F", mata_pelajaran: "Bahasa Indonesia" },
      { id: "sm2-12", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "8D", mata_pelajaran: "Bahasa Indonesia" },
    ],
  },

  // 18. Taufik Zulkarnaen, S.Pd (Bahasa Inggris / Matematika)
  "b0000001-0000-0000-0000-000000000018": {
    teacher_id: "b0000001-0000-0000-0000-000000000018",
    nama_lengkap: "Taufik Zulkarnaen, S.Pd",
    slots: [
      { id: "tz-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "9A", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-2", hari: "Senin", jam_ke: "Jam Ke 4", waktu: "10:10 - 10:45", kelas: "9G", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-3", hari: "Senin", jam_ke: "Jam Ke 6", waktu: "11:20 - 11:55", kelas: "9B", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-4", hari: "Senin", jam_ke: "Jam Ke 8-9", waktu: "13:20 - 14:30", kelas: "9F", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-5", hari: "Selasa", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "9C", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-6", hari: "Selasa", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "7H", mata_pelajaran: "Matematika" },
      { id: "tz-7", hari: "Selasa", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "9A", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-8", hari: "Rabu", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "9C", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-9", hari: "Rabu", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "9B", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-10", hari: "Rabu", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 12:00", kelas: "7H", mata_pelajaran: "Matematika" },
      { id: "tz-11", hari: "Rabu", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "9D", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-12", hari: "Kamis", jam_ke: "Jam Ke 3-4", waktu: "09:15 - 10:50", kelas: "9F", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-13", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "9D", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-14", hari: "Kamis", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "9E", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-15", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:00", kelas: "9G", mata_pelajaran: "Bahasa Inggris" },
      { id: "tz-16", hari: "Jumat", jam_ke: "Jam Ke 3-4", waktu: "09:00 - 10:20", kelas: "9E", mata_pelajaran: "Bahasa Inggris" },
    ],
  },

  // 19. Imas Masitoh, S.Pd (Bahasa Inggris)
  "b0000001-0000-0000-0000-000000000019": {
    teacher_id: "b0000001-0000-0000-0000-000000000019",
    nama_lengkap: "Imas Masitoh, S.Pd",
    slots: [
      { id: "im-1", hari: "Senin", jam_ke: "Jam Ke 4-5", waktu: "10:10 - 11:20", kelas: "7B", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-2", hari: "Senin", jam_ke: "Jam Ke 6-7", waktu: "11:20 - 13:20", kelas: "7G", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-3", hari: "Selasa", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "7G", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-4", hari: "Selasa", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 11:25", kelas: "7E", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-5", hari: "Selasa", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7F", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-6", hari: "Rabu", jam_ke: "Jam Ke 3-4", waktu: "09:15 - 10:50", kelas: "7F", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-7", hari: "Rabu", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "7A", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-8", hari: "Rabu", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7C", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-9", hari: "Kamis", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "7B", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-10", hari: "Kamis", jam_ke: "Jam Ke 3-4", waktu: "09:15 - 10:50", kelas: "7A", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-11", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "7D", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-12", hari: "Kamis", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7C", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-13", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:00", kelas: "7E", mata_pelajaran: "Bahasa Inggris" },
      { id: "im-14", hari: "Jumat", jam_ke: "Jam Ke 5-6", waktu: "10:20 - 11:20", kelas: "7D", mata_pelajaran: "Bahasa Inggris" },
    ],
  },

  // 20. Nia Kurniawati, S.Pd (IPA)
  "b0000001-0000-0000-0000-000000000020": {
    teacher_id: "b0000001-0000-0000-0000-000000000020",
    nama_lengkap: "Nia Kurniawati, S.Pd",
    slots: [
      { id: "nk-1", hari: "Senin", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:10", kelas: "7D", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-2", hari: "Senin", jam_ke: "Jam Ke 4-5", waktu: "10:10 - 11:20", kelas: "7E", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-3", hari: "Senin", jam_ke: "Jam Ke 7-8", waktu: "12:45 - 13:55", kelas: "7A", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7F", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-5", hari: "Selasa", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 11:25", kelas: "7G", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-6", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7C", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-7", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7B", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-8", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 10:50", kelas: "7A", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-9", hari: "Rabu", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "7C", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-10", hari: "Kamis", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "7F", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-11", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 11:25", kelas: "7B", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-12", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "7G", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-13", hari: "Jumat", jam_ke: "Jam Ke 3-4", waktu: "09:00 - 10:20", kelas: "7D", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "nk-14", hari: "Jumat", jam_ke: "Jam Ke 5-6", waktu: "10:20 - 11:20", kelas: "7E", mata_pelajaran: "Ilmu Pengetahuan Alam" },
    ],
  },

  // 21. Dian Permatasari, S.Pd (IPA)
  "b0000001-0000-0000-0000-000000000021": {
    teacher_id: "b0000001-0000-0000-0000-000000000021",
    nama_lengkap: "Dian Permatasari, S.Pd",
    slots: [
      { id: "dp-1", hari: "Senin", jam_ke: "Jam Ke 3-5", waktu: "09:10 - 11:20", kelas: "9D", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-2", hari: "Senin", jam_ke: "Jam Ke 6-7", waktu: "11:20 - 13:20", kelas: "9F", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-3", hari: "Senin", jam_ke: "Jam Ke 8-9", waktu: "13:20 - 14:30", kelas: "9G", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9G", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-5", hari: "Selasa", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 11:25", kelas: "9C", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-6", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9B", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-7", hari: "Rabu", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "9A", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-8", hari: "Rabu", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 11:25", kelas: "9B", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-9", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9E", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-10", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9F", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-11", hari: "Kamis", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 10:50", kelas: "9D", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-12", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9C", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-13", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:00", kelas: "9E", mata_pelajaran: "Ilmu Pengetahuan Alam" },
      { id: "dp-14", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "9A", mata_pelajaran: "Ilmu Pengetahuan Alam" },
    ],
  },

  // 22. Aisyah Nurul Amini, S.Pd (Matematika)
  "b0000001-0000-0000-0000-000000000022": {
    teacher_id: "b0000001-0000-0000-0000-000000000022",
    nama_lengkap: "Aisyah Nurul Amini, S.Pd",
    slots: [
      { id: "an-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "8F", mata_pelajaran: "Matematika" },
      { id: "an-2", hari: "Senin", jam_ke: "Jam Ke 5-6", waktu: "10:45 - 11:55", kelas: "8D", mata_pelajaran: "Matematika" },
      { id: "an-3", hari: "Senin", jam_ke: "Jam Ke 8-9", waktu: "13:20 - 14:30", kelas: "8G", mata_pelajaran: "Matematika" },
      { id: "an-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "8A", mata_pelajaran: "Matematika" },
      { id: "an-5", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "8B", mata_pelajaran: "Matematika" },
      { id: "an-6", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "8G", mata_pelajaran: "Matematika" },
      { id: "an-7", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "8E", mata_pelajaran: "Matematika" },
      { id: "an-8", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8D", mata_pelajaran: "Matematika" },
      { id: "an-9", hari: "Kamis", jam_ke: "Jam Ke 1-2", waktu: "07:30 - 08:40", kelas: "8B", mata_pelajaran: "Matematika" },
      { id: "an-10", hari: "Kamis", jam_ke: "Jam Ke 3-4", waktu: "08:40 - 09:50", kelas: "8F", mata_pelajaran: "Matematika" },
      { id: "an-11", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 12:00", kelas: "8C", mata_pelajaran: "Matematika" },
      { id: "an-12", hari: "Kamis", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "8E", mata_pelajaran: "Matematika" },
      { id: "an-13", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:00", kelas: "8C", mata_pelajaran: "Matematika" },
      { id: "an-14", hari: "Jumat", jam_ke: "Jam Ke 5-6", waktu: "10:20 - 11:20", kelas: "8A", mata_pelajaran: "Matematika" },
    ],
  },

  // 23. Ainun Fitri, S.Pd (Prakarya)
  "b0000001-0000-0000-0000-000000000023": {
    teacher_id: "b0000001-0000-0000-0000-000000000023",
    nama_lengkap: "Ainun Fitri, S.Pd",
    slots: [
      { id: "af-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "7C", mata_pelajaran: "Prakarya" },
      { id: "af-2", hari: "Senin", jam_ke: "Jam Ke 4-6", waktu: "10:10 - 11:55", kelas: "9A", mata_pelajaran: "Prakarya" },
      { id: "af-3", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "9D", mata_pelajaran: "Prakarya" },
      { id: "af-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "7B", mata_pelajaran: "Prakarya" },
      { id: "af-5", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "7D", mata_pelajaran: "Prakarya" },
      { id: "af-6", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9G", mata_pelajaran: "Prakarya" },
      { id: "af-7", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9E", mata_pelajaran: "Prakarya" },
      { id: "af-8", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9F", mata_pelajaran: "Prakarya" },
      { id: "af-9", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9C", mata_pelajaran: "Prakarya" },
      { id: "af-10", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:30", kelas: "9B", mata_pelajaran: "Prakarya" },
      { id: "af-11", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "7A", mata_pelajaran: "Prakarya" },
    ],
  },

  // 24. Sofiyah, S.Sos (Pendidikan Pancasila)
  "b0000001-0000-0000-0000-000000000024": {
    teacher_id: "b0000001-0000-0000-0000-000000000024",
    nama_lengkap: "Sofiyah, S.Sos",
    slots: [
      { id: "sf-1", hari: "Senin", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:10", kelas: "8E", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-2", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "8F", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-3", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "8C", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-4", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9D", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-5", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8A", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-6", hari: "Rabu", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9F", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-7", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "8B", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-8", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8G", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-9", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9E", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-10", hari: "Kamis", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "8D", mata_pelajaran: "Pendidikan Pancasila" },
      { id: "sf-11", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9G", mata_pelajaran: "Pendidikan Pancasila" },
    ],
  },

  // 25. Fingkan Ellita, S.Pd (Prakarya / IPS / Bahasa Inggris)
  "b0000001-0000-0000-0000-000000000025": {
    teacher_id: "b0000001-0000-0000-0000-000000000025",
    nama_lengkap: "Fingkan Ellita, S.Pd",
    slots: [
      { id: "fe-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "8B", mata_pelajaran: "Prakarya" },
      { id: "fe-2", hari: "Senin", jam_ke: "Jam Ke 4-6", waktu: "10:10 - 11:55", kelas: "8F", mata_pelajaran: "Prakarya" },
      { id: "fe-3", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "8C", mata_pelajaran: "Prakarya" },
      { id: "fe-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "8E", mata_pelajaran: "Prakarya" },
      { id: "fe-5", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "8A", mata_pelajaran: "Prakarya" },
      { id: "fe-6", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8D", mata_pelajaran: "Prakarya" },
      { id: "fe-7", hari: "Rabu", jam_ke: "Jam Ke 3-4", waktu: "09:15 - 10:50", kelas: "7D", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "fe-8", hari: "Rabu", jam_ke: "Jam Ke 5-6", waktu: "10:50 - 12:00", kelas: "7F", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "fe-9", hari: "Rabu", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7H", mata_pelajaran: "Bahasa Inggris" },
      { id: "fe-10", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "8G", mata_pelajaran: "Prakarya" },
      { id: "fe-11", hari: "Kamis", jam_ke: "Jam Ke 5-6", waktu: "10:15 - 11:25", kelas: "7F", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "fe-12", hari: "Kamis", jam_ke: "Jam Ke 7-8", waktu: "13:00 - 14:10", kelas: "7E", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "fe-13", hari: "Jumat", jam_ke: "Jam Ke 1-2", waktu: "08:00 - 09:00", kelas: "7D", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "fe-14", hari: "Jumat", jam_ke: "Jam Ke 3-4", waktu: "09:00 - 10:20", kelas: "7E", mata_pelajaran: "Ilmu Pengetahuan Sosial" },
      { id: "fe-15", hari: "Jumat", jam_ke: "Jam Ke 5-6", waktu: "10:20 - 11:20", kelas: "7H", mata_pelajaran: "Bahasa Inggris" },
    ],
  },

  // 26. Lucky Aditya Putra, S.Kom (Informatika)
  "b0000001-0000-0000-0000-000000000026": {
    teacher_id: "b0000001-0000-0000-0000-000000000026",
    nama_lengkap: "Lucky Aditya Putra, S.Kom",
    slots: [
      { id: "la-1", hari: "Senin", jam_ke: "Jam Ke 1-3", waktu: "08:00 - 09:45", kelas: "9G", mata_pelajaran: "Informatika" },
      { id: "la-2", hari: "Senin", jam_ke: "Jam Ke 4-6", waktu: "10:10 - 11:55", kelas: "9C", mata_pelajaran: "Informatika" },
      { id: "la-3", hari: "Senin", jam_ke: "Jam Ke 7-9", waktu: "12:45 - 14:30", kelas: "9E", mata_pelajaran: "Informatika" },
      { id: "la-4", hari: "Selasa", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "8D", mata_pelajaran: "Informatika" },
      { id: "la-5", hari: "Selasa", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "8E", mata_pelajaran: "Informatika" },
      { id: "la-6", hari: "Selasa", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "9F", mata_pelajaran: "Informatika" },
      { id: "la-7", hari: "Rabu", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "8C", mata_pelajaran: "Informatika" },
      { id: "la-8", hari: "Rabu", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8F", mata_pelajaran: "Informatika" },
      { id: "la-9", hari: "Kamis", jam_ke: "Jam Ke 1-3", waktu: "07:30 - 09:15", kelas: "9A", mata_pelajaran: "Informatika" },
      { id: "la-10", hari: "Kamis", jam_ke: "Jam Ke 4-5", waktu: "09:15 - 11:25", kelas: "9B", mata_pelajaran: "Informatika" },
      { id: "la-11", hari: "Kamis", jam_ke: "Jam Ke 6-8", waktu: "11:25 - 14:10", kelas: "8G", mata_pelajaran: "Informatika" },
      { id: "la-12", hari: "Jumat", jam_ke: "Jam Ke 4-5", waktu: "09:50 - 11:20", kelas: "9D", mata_pelajaran: "Informatika" },
    ],
  },
};

/**
 * Konversi tanggal (YYYY-MM-DD) ke nama hari dalam Bahasa Indonesia
 */
export function getDayNameFromDate(dateStr: string): DayName | null {
  if (!dateStr) return null;
  // Gunakan parsing lokal agar zona waktu tidak menggeser hari
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  const dayIndex = d.getDay(); // 0: Minggu, 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu

  switch (dayIndex) {
    case 1:
      return "Senin";
    case 2:
      return "Selasa";
    case 3:
      return "Rabu";
    case 4:
      return "Kamis";
    case 5:
      return "Jumat";
    default:
      return null; // Akhir pekan (Sabtu / Minggu)
  }
}

/**
 * Dapatkan jadwal mengajar guru berdasarkan teacher_id atau nama
 */
export function getTeacherSchedule(teacherId: string, teacherName?: string): TeacherSchedule | null {
  if (TEACHER_SCHEDULES[teacherId]) {
    return TEACHER_SCHEDULES[teacherId];
  }
  if (teacherName) {
    const found = Object.values(TEACHER_SCHEDULES).find((ts) =>
      ts.nama_lengkap.toLowerCase().includes(teacherName.toLowerCase()) ||
      teacherName.toLowerCase().includes(ts.nama_lengkap.toLowerCase())
    );
    if (found) return found;
  }
  return null;
}

/**
 * Dapatkan slot mengajar guru pada hari tertentu
 */
export function getTeachingSlotsByDay(teacherId: string, day: DayName): TeachingSlot[] {
  const schedule = getTeacherSchedule(teacherId);
  if (!schedule) return [];
  return schedule.slots.filter((s) => s.hari === day);
}

/**
 * Dapatkan daftar hari mengajar unik bagi seorang guru
 */
export function getTeachingDays(teacherId: string): DayName[] {
  const schedule = getTeacherSchedule(teacherId);
  if (!schedule) return [];
  const days = Array.from(new Set(schedule.slots.map((s) => s.hari)));
  // Urutkan sesuai hari sekolah Senin s.d. Jumat
  const order: DayName[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  return order.filter((d) => days.includes(d));
}

/**
 * Validasi apakah tanggal observasi cocok dengan jadwal mengajar guru
 */
export function validateObservationDateAgainstSchedule(
  teacherId: string,
  dateStr: string
): {
  isValid: boolean;
  dayName: string | null;
  slots: TeachingSlot[];
  message?: string;
} {
  const day = getDayNameFromDate(dateStr);
  if (!day) {
    return {
      isValid: false,
      dayName: null,
      slots: [],
      message: "Tanggal yang dipilih jatuh pada hari libur akhir pekan (Sabtu/Minggu). Observasi hanya dapat dijadwalkan pada hari efektif belajar (Senin s.d. Jumat).",
    };
  }

  const schedule = getTeacherSchedule(teacherId);
  if (!schedule) {
    // Jika guru belum terdaftar di jadwal aSc, beri toleransi
    return {
      isValid: true,
      dayName: day,
      slots: [],
    };
  }

  const slots = schedule.slots.filter((s) => s.hari === day);
  if (slots.length === 0) {
    const availableDays = getTeachingDays(teacherId).join(", ");
    return {
      isValid: false,
      dayName: day,
      slots: [],
      message: `Guru ${schedule.nama_lengkap} tidak memiliki jadwal mengajar pada hari ${day}. Hari mengajar yang tersedia: ${availableDays}.`,
    };
  }

  return {
    isValid: true,
    dayName: day,
    slots,
  };
}
