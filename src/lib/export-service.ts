/**
 * Utilitas Layanan Ekspor Data Excel (.xlsx) dan CSV (.csv)
 * Menghasilkan luaran spreadsheet berkolom rapi yang siap dibuka di Microsoft Excel,
 * LibreOffice, WPS Office, dan Google Sheets tanpa masalah teks tergabung atau koma berantakan.
 */

import * as XLSX from "xlsx";

export interface ExportTableOptions {
  filename: string;
  sheetName?: string;
  title?: string;
  metadata?: { label: string; value: string }[];
  headers: string[];
  rows: (string | number | null | undefined)[][];
}

/**
 * Mengunduh berkas biner Microsoft Excel asli (.xlsx)
 * Kolom otomatis terpisah rapi dengan lebar kolom yang proporsional
 */
export function downloadAsExcel({
  filename,
  sheetName = "Data Supervisi",
  title,
  metadata,
  headers,
  rows,
}: ExportTableOptions): void {
  // Susun data baris per baris
  const sheetData: (string | number)[][] = [];

  // 1. Blok Judul Resmi (jika ada)
  if (title) {
    sheetData.push([title.toUpperCase()]);
    sheetData.push([]);
  }

  // 2. Blok Metadata Identitas Sekolah / Dokumen (jika ada)
  if (metadata && metadata.length > 0) {
    metadata.forEach((meta) => {
      sheetData.push([meta.label, meta.value]);
    });
    sheetData.push([]); // Baris kosong pemisah
  }

  // 3. Header Tabel
  sheetData.push(headers);

  // 4. Data Baris (bersihkan nilai null/undefined menjadi string kosong atau '-')
  rows.forEach((row) => {
    sheetData.push(
      row.map((val) => {
        if (val === null || val === undefined) return "-";
        return val;
      })
    );
  });

  // Buat WorkSheet dari Array of Arrays
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Hitung lebar kolom otomatis agar teks tidak terpotong (min 10, max 45 karakter)
  const colWidths = headers.map((header, colIndex) => {
    let maxLength = String(header).length;
    rows.forEach((row) => {
      const cellVal = row[colIndex];
      if (cellVal != null) {
        const len = String(cellVal).length;
        if (len > maxLength) maxLength = len;
      }
    });
    return { wch: Math.min(Math.max(maxLength + 3, 10), 45) };
  });

  ws["!cols"] = colWidths;

  // Buat WorkBook dan tambahkan sheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // Batas nama sheet Excel 31 karakter

  // Tulis berkas biner .xlsx
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  triggerBrowserDownload(blob, ensureExtension(filename, ".xlsx"));
}

/**
 * Mengunduh berkas CSV ramah pengguna Indonesia (.csv)
 * Menggunakan pemisah titik koma (;) dan Byte Order Mark UTF-8 agar Excel otomatis memisahkan kolom
 */
export function downloadAsCSV({
  filename,
  headers,
  rows,
}: Omit<ExportTableOptions, "sheetName" | "title" | "metadata">): void {
  // Format baris CSV dengan delimiter titik koma (;)
  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""'); // Escape kutip ganda
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(";");
  const dataLines = rows.map((row) => row.map(escapeCell).join(";"));

  // Tambahkan penegas sep=; dan UTF-8 BOM (\uFEFF) di awal berkas
  // agar Excel di semua versi/bahasa langsung memisahkan kolom secara otomatis
  const csvContent = "\uFEFFsep=;\r\n" + [headerLine, ...dataLines].join("\r\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  triggerBrowserDownload(blob, ensureExtension(filename, ".csv"));
}

/**
 * Memicu pengunduhan berkas pada peramban web
 */
function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Memastikan ekstensi berkas sesuai
 */
function ensureExtension(filename: string, ext: string): string {
  const sanitized = filename.replace(/\s+/g, "_");
  return sanitized.endsWith(ext) ? sanitized : `${sanitized}${ext}`;
}
