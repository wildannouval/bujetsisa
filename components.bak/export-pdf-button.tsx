"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface ExportPDFProps {
  data: any[];
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
}

export function ExportPDFButton({ data, summary }: ExportPDFProps) {
  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const date = new Date();
      const monthYear = date.toLocaleString("id-ID", {
        month: "long",
        year: "numeric",
      });

      // 1. Header Laporan
      doc.setFontSize(18);
      doc.text("BUJETSISA - LAPORAN KEUANGAN", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Periode: ${monthYear}`, 14, 28);
      doc.text(`Tanggal Cetak: ${date.toLocaleString("id-ID")}`, 14, 33);

      // 2. Ringkasan Saldo
      autoTable(doc, {
        startY: 40,
        head: [["Deskripsi", "Total Nominal"]],
        body: [
          ["Total Pemasukan", `Rp ${summary.income.toLocaleString("id-ID")}`],
          [
            "Total Pengeluaran",
            `Rp ${summary.expense.toLocaleString("id-ID")}`,
          ],
          ["Saldo Akhir", `Rp ${summary.balance.toLocaleString("id-ID")}`],
        ],
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      });

      // 3. Detail Transaksi
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("RIWAYAT TRANSAKSI", 14, finalY);

      const tableData = data.map((tx) => [
        tx.date,
        tx.description || "-",
        tx.categories?.name || "Lainnya",
        tx.type === "income" ? "Masuk" : "Keluar",
        `Rp ${Number(tx.amount).toLocaleString("id-ID")}`,
      ]);

      autoTable(doc, {
        startY: finalY + 5,
        head: [["Tanggal", "Keterangan", "Kategori", "Tipe", "Nominal"]],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [71, 85, 105] },
      });

      // 4. Footer & Penomoran Halaman
      const pageCount = doc.getNumberOfPages(); // Memperbaiki error TS
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();
        doc.text(`Halaman ${i} dari ${pageCount}`, 14, pageHeight - 10);
      }

      doc.save(`Laporan_${monthYear.replace(" ", "_")}.pdf`);
      toast.success("Laporan PDF berhasil diunduh!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat PDF.");
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      className="h-9 gap-2"
    >
      <FileDown size={16} />
      <span>Export PDF</span>
    </Button>
  );
}
