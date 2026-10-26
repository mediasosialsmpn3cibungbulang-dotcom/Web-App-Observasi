import assert from "node:assert";
import {
  calculateObservationTotalScore,
  calculateObservationPercentage,
  determinePredicate,
  calculateAspectAverage,
  determinePriorityAspect,
  calculateProgressAndTrend,
  evaluateTargetStatus,
  deriveAcademicSemester,
  determineSupervisionStatus,
  isFollowupOverdue,
  isScheduleMissed,
  calculateMinimumSupervisionFrequency,
  generateAutoRecommendation,
  calculateChecklistProgress,
} from "./scoring";
import {
  validateObservationDateAgainstSchedule,
  getTeachingDays,
} from "../contracts/teaching-schedules";

console.log("🧪 Menjalankan Smoke Test Aturan Bisnis Domain (BR-01 s.d. BR-18)...");

// 1. Uji Paritas Skor & Predikat Ambang Batas (Tabel Bukti PRD Seksi 5)
{
  // 28 skor bernilai 3
  const scores3 = Array(28).fill(3);
  const total84 = calculateObservationTotalScore(scores3);
  assert.strictEqual(total84, 84, "Total 28 skor bernilai 3 harus 84");
  const pct75 = calculateObservationPercentage(total84);
  assert.strictEqual(pct75, 75.0, "Persentase total 84 harus 75.0%");
  assert.strictEqual(determinePredicate(pct75), "Baik", "75.0% tepat pada batas ambang 'Baik'");

  // 28 skor bernilai 4
  const scores4 = Array(28).fill(4);
  const total112 = calculateObservationTotalScore(scores4);
  assert.strictEqual(total112, 112, "Total 28 skor bernilai 4 harus 112");
  const pct100 = calculateObservationPercentage(total112);
  assert.strictEqual(pct100, 100.0, "Persentase total 112 harus 100.0%");
  assert.strictEqual(determinePredicate(pct100), "Amat Baik", "100.0% harus 'Amat Baik'");

  // 28 skor bernilai 2
  const scores2 = Array(28).fill(2);
  const total56 = calculateObservationTotalScore(scores2);
  assert.strictEqual(total56, 56, "Total 28 skor bernilai 2 harus 56");
  const pct50 = calculateObservationPercentage(total56);
  assert.strictEqual(pct50, 50.0, "Persentase total 56 harus 50.0%");
  assert.strictEqual(determinePredicate(pct50), "Perlu Pembinaan", "50.0% harus 'Perlu Pembinaan'");

  // Ambang batas 90% (Total 101 vs Total 100)
  const pct101 = calculateObservationPercentage(101); // 90.178 -> 90.2%
  const pct100_skor = calculateObservationPercentage(100); // 89.285 -> 89.3%
  assert.strictEqual(pct101, 90.2);
  assert.strictEqual(pct100_skor, 89.3);
  assert.strictEqual(determinePredicate(pct101), "Amat Baik");
  assert.strictEqual(determinePredicate(pct100_skor), "Baik");

  // Ambang batas 60% (Total 68 vs Total 67)
  const pct68 = calculateObservationPercentage(68); // 60.714 -> 60.7%
  const pct67 = calculateObservationPercentage(67); // 59.821 -> 59.8%
  assert.strictEqual(pct68, 60.7);
  assert.strictEqual(pct67, 59.8);
  assert.strictEqual(determinePredicate(pct68), "Cukup");
  assert.strictEqual(determinePredicate(pct67), "Perlu Pembinaan");

  // Hanya 27 skor terisi (data belum lengkap)
  const incomplete27 = Array(27).fill(3);
  assert.strictEqual(calculateObservationTotalScore(incomplete27), null);
}

// 2. Uji Penentuan Semester Berdasarkan Tanggal (BR-09)
{
  assert.strictEqual(deriveAcademicSemester("2026-10-24"), "2026/2027 Ganjil");
  assert.strictEqual(deriveAcademicSemester("2027-02-10"), "2026/2027 Genap");
  assert.strictEqual(deriveAcademicSemester("2027-07-01"), "2027/2028 Ganjil");
}

// 3. Uji Rata-rata Aspek & Aspek Prioritas (BR-04)
{
  const aspectA = calculateAspectAverage([3, 4, 3, 4]); // 3.5
  const aspectB = calculateAspectAverage([2, 3, 2, 2]); // 2.25
  const aspectC = calculateAspectAverage([4, 4, 4, 4]); // 4.0
  assert.strictEqual(aspectA, 3.5);
  assert.strictEqual(aspectB, 2.25);
  assert.strictEqual(aspectC, 4.0);

  const priority = determinePriorityAspect({ A: 3.5, B: 2.25, C: 4.0, D: 3.0 });
  assert.strictEqual(priority, "B", "Aspek B memiliki rata-rata terendah (2.25) sehingga jadi prioritas");

  // Uji kondisi tie (A dan C sama-sama 2.0 -> pilih A)
  const tiePriority = determinePriorityAspect({ A: 2.0, B: 3.0, C: 2.0 });
  assert.strictEqual(tiePriority, "A", "Saat seri, urutan alfabetis terdahulu harus dipilih");
}

// 4. Uji Perkembangan & Tren (BR-06 & BR-07)
{
  // Naik > 2.0 poin
  const resNaik = calculateProgressAndTrend(70.0, 75.0, 2.0);
  assert.strictEqual(resNaik.progress, 5.0);
  assert.strictEqual(resNaik.trend, "Meningkat");

  // Turun > 2.0 poin
  const resTurun = calculateProgressAndTrend(80.0, 77.0, 2.0);
  assert.strictEqual(resTurun.progress, -3.0);
  assert.strictEqual(resTurun.trend, "Menurun");

  // Stagnan (selisih <= 2.0 poin)
  const resStagnan = calculateProgressAndTrend(75.0, 76.5, 2.0);
  assert.strictEqual(resStagnan.progress, 1.5);
  assert.strictEqual(resStagnan.trend, "Stagnan");
}

// 5. Uji Status Target (BR-08)
{
  assert.strictEqual(evaluateTargetStatus(null, 80), "Belum Ada Data");
  assert.strictEqual(evaluateTargetStatus(85.0, 80), "Tercapai");
  assert.strictEqual(evaluateTargetStatus(78.0, 80), "Belum Tercapai");
}

// 6. Uji Status Supervisi Runtime (BR-10)
{
  assert.strictEqual(
    determineSupervisionStatus({
      hasCompletedObservation: true,
      hasFollowup: true,
      hasPreObservation: true,
      hasDraftObservation: false,
    }),
    "Selesai"
  );
  assert.strictEqual(
    determineSupervisionStatus({
      hasCompletedObservation: false,
      hasFollowup: false,
      hasPreObservation: true,
      hasDraftObservation: false,
    }),
    "Dalam Proses"
  );
  assert.strictEqual(
    determineSupervisionStatus({
      hasCompletedObservation: false,
      hasFollowup: false,
      hasPreObservation: false,
      hasDraftObservation: false,
    }),
    "Belum Mulai"
  );
}

// 7. Uji Keterlambatan Tindak Lanjut & Jadwal Terlewat (BR-11 & BR-12)
{
  const pastDate = "2026-01-01";
  const futureDate = "2027-12-31";
  const refToday = new Date("2026-10-24T12:00:00Z");

  assert.strictEqual(isFollowupOverdue(pastDate, "Berjalan", refToday), true);
  assert.strictEqual(isFollowupOverdue(pastDate, "Selesai", refToday), false);
  assert.strictEqual(isFollowupOverdue(futureDate, "Pending", refToday), false);

  assert.strictEqual(isScheduleMissed(pastDate, false, refToday), true);
  assert.strictEqual(isScheduleMissed(pastDate, true, refToday), false);
  assert.strictEqual(isScheduleMissed(futureDate, false, refToday), false);
}

// 8. Uji Frekuensi Supervisi Minimum (BR-13 & BR-15)
{
  // Guru baru (masa kerja < 3 tahun)
  assert.strictEqual(
    calculateMinimumSupervisionFrequency({
      tahunMasuk: 2025,
      currentYear: 2026,
      isSeniorMentor: false,
      latestScore: 85,
    }),
    3
  );

  // Guru reguler dengan nilai normal
  assert.strictEqual(
    calculateMinimumSupervisionFrequency({
      tahunMasuk: 2018,
      currentYear: 2026,
      isSeniorMentor: false,
      latestScore: 82,
    }),
    2
  );

  // Guru bernilai rendah (< 70)
  assert.strictEqual(
    calculateMinimumSupervisionFrequency({
      tahunMasuk: 2018,
      currentYear: 2026,
      isSeniorMentor: false,
      latestScore: 65,
    }),
    3
  );

  // Guru senior/mentor
  assert.strictEqual(
    calculateMinimumSupervisionFrequency({
      tahunMasuk: 2010,
      currentYear: 2026,
      isSeniorMentor: true,
      latestScore: 92,
    }),
    1
  );
}

// 9. Uji Rekomendasi Otomatis (BR-16)
{
  const recAmatBaik = generateAutoRecommendation("Amat Baik", "Diferensiasi");
  assert.match(recAmatBaik, /Pertahankan prestasi/);
  assert.match(recAmatBaik, /Diferensiasi/);

  const recPerlu = generateAutoRecommendation("Perlu Pembinaan", "Pengelolaan Kelas");
  assert.match(recPerlu, /Pembinaan intensif/);
  assert.match(recPerlu, /Pengelolaan Kelas/);
}

// 10. Uji Persentase Progres Checklist Semesteran (BR-17)
{
  // 10 item: 5 Selesai, 2 Berjalan, 1 Belum, 2 Tidak Berlaku
  // Effective: 10 - 2 = 8. Selesai = 5. Persen = (5 / 8) * 100 = 62.5%
  const res1 = calculateChecklistProgress([
    "Selesai",
    "Selesai",
    "Selesai",
    "Selesai",
    "Selesai",
    "Berjalan",
    "Berjalan",
    "Belum",
    "Tidak Berlaku",
    "Tidak Berlaku",
  ]);
  assert.strictEqual(res1.percentage, 62.5);
  assert.strictEqual(res1.effectiveTotal, 8);
  assert.strictEqual(res1.selesai, 5);

  // Seluruh item Tidak Berlaku
  const res2 = calculateChecklistProgress(["Tidak Berlaku", "Tidak Berlaku"]);
  assert.strictEqual(res2.percentage, 100);
}

// 11. Uji Keselarasan Jadwal Observasi dengan Jadwal Mengajar aSc Timetables (SOP Validasi KBM)
{
  const lilisId = "a2222222-2222-2222-2222-222222222222"; // Lilis Yuliati, M.Pd (IPA)
  const lilisDays = getTeachingDays(lilisId);
  assert.ok(lilisDays.includes("Senin"), "Lilis harus mengajar di hari Senin");
  assert.ok(lilisDays.includes("Selasa"), "Lilis harus mengajar di hari Selasa");
  assert.ok(lilisDays.includes("Kamis"), "Lilis harus mengajar di hari Kamis");

  // Uji tanggal observasi sah (2026-09-08 adalah hari Selasa)
  const validCheck = validateObservationDateAgainstSchedule(lilisId, "2026-09-08");
  assert.strictEqual(validCheck.isValid, true, "2026-09-08 (Selasa) harus valid untuk Lilis Yuliati");
  assert.strictEqual(validCheck.dayName, "Selasa");
  assert.ok(validCheck.slots.length > 0, "Harus memiliki slot mengajar di hari Selasa");
  assert.strictEqual(validCheck.slots[0].kelas, "8F", "Slot pertama Selasa adalah kelas 8F");

  // Uji tanggal akhir pekan (2026-09-12 adalah hari Sabtu)
  const weekendCheck = validateObservationDateAgainstSchedule(lilisId, "2026-09-12");
  assert.strictEqual(weekendCheck.isValid, false, "Hari Sabtu harus ditolak");
  assert.match(weekendCheck.message || "", /akhir pekan/i);

  // Uji guru ke-26 Lucky Aditya Putra (Informatika)
  const luckyId = "b0000001-0000-0000-0000-000000000026";
  const luckyDays = getTeachingDays(luckyId);
  assert.ok(luckyDays.length > 0, "Lucky Aditya Putra harus memiliki jadwal mengajar terdaftar di aSc");
}

console.log("✅ SELURUH SMOKE TEST ATURAN BISNIS DOMAIN LULUS 100%!");
