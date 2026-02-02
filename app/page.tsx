import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Banknote,
  Wallet,
  PieChart,
  Target,
  CreditCard,
  FileText,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Wallet,
      title: "Kelola Dompet",
      description:
        "Pantau saldo dari berbagai dompet - tunai, bank, dan e-wallet dalam satu tempat.",
    },
    {
      icon: PieChart,
      title: "Anggaran Cerdas",
      description:
        "Buat anggaran bulanan per kategori dan pantau pengeluaran Anda secara real-time.",
    },
    {
      icon: Target,
      title: "Target Tabungan",
      description:
        "Tetapkan target tabungan dan lacak progres Anda menuju impian finansial.",
    },
    {
      icon: CreditCard,
      title: "Hutang & Piutang",
      description:
        "Catat dan kelola hutang serta piutang dengan pengingat jatuh tempo.",
    },
    {
      icon: FileText,
      title: "Laporan Lengkap",
      description:
        "Analisis keuangan dengan laporan bulanan, tahunan, dan grafik visual.",
    },
    {
      icon: Banknote,
      title: "Transfer Mudah",
      description:
        "Transfer antar dompet dengan pencatatan otomatis di kedua sisi.",
    },
  ];

  const benefits = [
    "Gratis selamanya",
    "Data aman di cloud",
    "Bahasa Indonesia",
    "Responsif di semua perangkat",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-sm">
              <Banknote className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl">BujetSisa</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Masuk</Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              <Link href="/auth/sign-up">Daftar Gratis</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Kelola Keuangan Pribadi{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                Lebih Mudah
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              BujetSisa membantu Anda mencatat pengeluaran, mengelola anggaran,
              dan mencapai target keuangan dengan antarmuka yang sederhana dan
              powerful.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 px-8"
              >
                <Link href="/auth/sign-up">
                  Mulai Gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link href="/auth/login">Sudah Punya Akun?</Link>
              </Button>
            </div>

            {/* Benefits */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Semua yang Anda Butuhkan
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Fitur lengkap untuk mengelola keuangan pribadi Anda
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-600/10">
                    <feature.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg">
            <CardContent className="py-16">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Siap Mengelola Keuangan Anda?
                </h2>
                <p className="mt-4 text-lg text-white/90">
                  Bergabunglah sekarang dan mulai perjalanan finansial Anda yang
                  lebih baik.
                </p>
                <div className="mt-8">
                  <Button
                    size="lg"
                    variant="secondary"
                    asChild
                    className="gap-2 px-8 font-semibold"
                  >
                    <Link href="/auth/sign-up">
                      Buat Akun Gratis
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-green-600 text-white">
              <Banknote className="h-4 w-4" />
            </div>
            <span className="font-semibold">BujetSisa</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 BujetSisa. Pengelola keuangan pribadi.
          </p>
        </div>
      </footer>
    </div>
  );
}
