"use client";

import { Button } from "@/components/ui/button";
import { IconFileDownload } from "@tabler/icons-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  year: number;
  data: { month: string; income: number; expense: number }[];
  summary: { income: number; expense: number };
}

export function YearlyExportPDFButton({ year, data, summary }: Props) {
  const exportPDF = () => {
    const doc = new jsPDF();
    const saving = summary.income - summary.expense;

    doc.setFontSize(18);
    doc.text(`LAPORAN KEUANGAN TAHUNAN - ${year}`, 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["Kategori", "Total Nilai"]],
      body: [
        ["Total Pemasukan", `Rp ${summary.income.toLocaleString("id-ID")}`],
        ["Total Pengeluaran", `Rp ${summary.expense.toLocaleString("id-ID")}`],
        ["Total Tabungan (Sisa)", `Rp ${saving.toLocaleString("id-ID")}`],
        [
          "Saving Rate",
          `${summary.income > 0 ? Math.round((saving / summary.income) * 100) : 0}%`,
        ],
      ],
      theme: "striped",
      headStyles: { fontStyle: "bold" }, // PERBAIKAN DI SINI
    });

    doc.text(
      "Rincian Arus Kas Bulanan",
      14,
      (doc as any).lastAutoTable.finalY + 15,
    );
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [["Bulan", "Pemasukan", "Pengeluaran", "Tabungan"]],
      body: data.map((d) => [
        d.month,
        `Rp ${d.income.toLocaleString("id-ID")}`,
        `Rp ${d.expense.toLocaleString("id-ID")}`,
        `Rp ${(d.income - d.expense).toLocaleString("id-ID")}`,
      ]),
    });

    doc.save(`Laporan_Tahunan_Finansiku_${year}.pdf`);
  };

  return (
    <Button
      onClick={exportPDF}
      variant="outline"
      size="sm"
      className="font-bold"
    >
      <IconFileDownload className="mr-2 size-4" /> Export PDF {year}
    </Button>
  );
}
