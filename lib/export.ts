"use client";

// Export utilities for BujetSisa
// Uses native browser capabilities for CSV export

export function exportToCSV(
  data: any[],
  filename: string,
  headers?: Record<string, string>,
) {
  if (data.length === 0) {
    alert("Tidak ada data untuk diekspor");
    return;
  }

  // Get headers from first object or use provided headers
  const keys = Object.keys(data[0]);
  const headerRow = headers
    ? keys.map((key) => headers[key] || key).join(",")
    : keys.join(",");

  // Create CSV content
  const csvContent = data
    .map((row) => {
      return keys
        .map((key) => {
          let value = row[key];

          // Handle null/undefined
          if (value === null || value === undefined) {
            value = "";
          }

          // Handle dates
          if (value instanceof Date) {
            value = value.toISOString().split("T")[0];
          }

          // Handle strings (escape quotes and wrap in quotes if contains comma)
          if (typeof value === "string") {
            if (
              value.includes(",") ||
              value.includes('"') ||
              value.includes("\n")
            ) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
          }

          return value;
        })
        .join(",");
    })
    .join("\n");

  const fullContent = headerRow + "\n" + csvContent;

  // Create and download file
  const blob = new Blob(["\ufeff" + fullContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTransactionsToCSV(transactions: any[]) {
  const data = transactions.map((t) => ({
    tanggal: t.date,
    deskripsi: t.description || "-",
    kategori: t.category?.name || "-",
    dompet: t.wallet?.name || "-",
    tipe: t.type === "income" ? "Pemasukan" : "Pengeluaran",
    jumlah: t.type === "income" ? t.amount : -t.amount,
  }));

  const headers = {
    tanggal: "Tanggal",
    deskripsi: "Deskripsi",
    kategori: "Kategori",
    dompet: "Dompet",
    tipe: "Tipe",
    jumlah: "Jumlah",
  };

  exportToCSV(data, "transaksi", headers);
}

export function exportWalletsToCSV(wallets: any[]) {
  const data = wallets.map((w) => ({
    nama: w.name,
    tipe: w.type === "cash" ? "Tunai" : w.type === "bank" ? "Bank" : "E-Wallet",
    saldo: w.balance,
  }));

  const headers = {
    nama: "Nama",
    tipe: "Tipe",
    saldo: "Saldo",
  };

  exportToCSV(data, "dompet", headers);
}

export function exportBudgetsToCSV(budgets: any[]) {
  const data = budgets.map((b) => ({
    kategori: b.category?.name || "-",
    anggaran: b.amount,
    periode:
      b.period === "monthly"
        ? "Bulanan"
        : b.period === "weekly"
          ? "Mingguan"
          : "Tahunan",
    terpakai: b.spent || 0,
    sisa: b.amount - (b.spent || 0),
  }));

  const headers = {
    kategori: "Kategori",
    anggaran: "Anggaran",
    periode: "Periode",
    terpakai: "Terpakai",
    sisa: "Sisa",
  };

  exportToCSV(data, "anggaran", headers);
}

export function exportGoalsToCSV(goals: any[]) {
  const data = goals.map((g) => ({
    nama: g.name,
    target: g.target_amount,
    terkumpul: g.current_amount,
    progres: ((g.current_amount / g.target_amount) * 100).toFixed(2) + "%",
    target_tanggal: g.target_date || "-",
    status:
      g.status === "active"
        ? "Aktif"
        : g.status === "completed"
          ? "Selesai"
          : "Dibatalkan",
  }));

  const headers = {
    nama: "Nama",
    target: "Target",
    terkumpul: "Terkumpul",
    progres: "Progres",
    target_tanggal: "Target Tanggal",
    status: "Status",
  };

  exportToCSV(data, "target", headers);
}

export function exportDebtsToCSV(debts: any[]) {
  const data = debts.map((d) => ({
    nama: d.name,
    jumlah: d.amount,
    tipe: d.type === "payable" ? "Hutang" : "Piutang",
    jatuh_tempo: d.due_date || "-",
    status: d.status === "paid" ? "Lunas" : "Belum Lunas",
    catatan: d.notes || "-",
  }));

  const headers = {
    nama: "Nama",
    jumlah: "Jumlah",
    tipe: "Tipe",
    jatuh_tempo: "Jatuh Tempo",
    status: "Status",
    catatan: "Catatan",
  };

  exportToCSV(data, "hutang_piutang", headers);
}

export function exportInvestmentsToCSV(investments: any[]) {
  const data = investments.map((i) => ({
    nama: i.name,
    tipe: i.type,
    ticker: i.ticker || "-",
    jumlah: i.quantity,
    harga_beli: i.avg_buy_price,
    harga_sekarang: i.current_price,
    nilai_investasi: i.quantity * i.avg_buy_price,
    nilai_sekarang: i.quantity * i.current_price,
    keuntungan: i.quantity * i.current_price - i.quantity * i.avg_buy_price,
    platform: i.platform || "-",
  }));

  const headers = {
    nama: "Nama",
    tipe: "Tipe",
    ticker: "Ticker",
    jumlah: "Jumlah",
    harga_beli: "Harga Beli Rata-rata",
    harga_sekarang: "Harga Sekarang",
    nilai_investasi: "Nilai Investasi",
    nilai_sekarang: "Nilai Sekarang",
    keuntungan: "Keuntungan/Rugi",
    platform: "Platform",
  };

  exportToCSV(data, "investasi", headers);
}
