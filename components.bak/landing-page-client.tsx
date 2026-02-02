"use client";

import * as React from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useSpring,
  useMotionTemplate,
  useMotionValue,
  Variants,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Coins,
  Target,
  ShieldCheck,
  ArrowRight,
  Rocket,
  Lock,
  MessageCircle,
  Receipt,
  BarChart3,
  Check,
  CheckCircle2,
  Globe,
  Fingerprint,
} from "lucide-react";

// --- DICTIONARY ---
const translations = {
  id: {
    nav: {
      features: "Fitur",
      pricing: "Harga",
      faq: "FAQ",
      login: "Masuk",
      start: "Mulai Gratis",
    },
    hero: {
      badge: "Sistem Manajemen Keuangan Modern",
      title1: "Kendali",
      title2: "Finansial.",
      desc: "Berhenti menebak ke mana uang Anda pergi. Bujetsisa adalah asisten finansial cerdas yang membantu Anda menguasai arus kas dan mencapai kebebasan finansial.",
      cta: "Mulai Sekarang",
    },
    features: {
      tag: "Fitur Unggulan",
      title: "Cerdas & Terukur.",
      desc: "Teknologi canggih untuk memantau setiap rupiah yang Anda miliki.",
      f1_title: "Analitik Arus Kas",
      f1_desc:
        "Visualisasi mendalam yang membedah kebiasaan belanja Anda secara otomatis.",
      f2_title: "Target Strategis",
      f2_desc:
        "Atur dan capai target tabungan Anda dengan prediksi waktu yang akurat.",
      f3_title: "Penagihan WhatsApp",
      f3_desc:
        "Kirim pengingat piutang secara sopan dan otomatis langsung ke kontak Anda.",
      f4_title: "Privasi Total",
      f4_desc:
        "Data Anda dienkripsi penuh. Hanya Anda yang memiliki akses ke laporan ini.",
    },
    pricing: {
      title: "Investasi Masa Depan.",
      desc: "Pilih paket yang sesuai dengan kebutuhan finansial Anda.",
      starter: {
        title: "Personal",
        desc: "Cocok untuk individu yang ingin mulai rapi.",
        price: "Gratis",
        period: "Selamanya",
      },
      pro: {
        title: "Professional",
        desc: "Fitur automasi tingkat lanjut untuk aset besar.",
        price: "Rp 19k",
        period: "/ Bulan",
      },
      items: [
        "Dashboard Analitik",
        "Transaksi Unlimited",
        "WhatsApp Sync",
        "Auto Bank Sync",
        "Analitik Pro",
      ],
      select: "Pilih Paket",
      soon: "Segera Hadir 2026",
    },
    faq: {
      title: "Tanya Jawab.",
      q1: "Apakah data saya benar-benar aman?",
      a1: "Ya, kami menggunakan enkripsi AES-256 dan database Supabase yang terisolasi secara aman.",
      q2: "Bagaimana cara kerja fitur WhatsApp?",
      a2: "Sistem menyiapkan pesan tagihan yang rapi, Anda cukup klik kirim melalui WhatsApp.",
      q3: "Bisa digunakan di banyak perangkat?",
      a3: "Ya, Anda bisa mengaksesnya dari laptop maupun smartphone secara real-time.",
    },
    cta: {
      title1: "Siap Kelola",
      title2: "Uang Sisa?",
      join: "Daftar Sekarang",
    },
    footer: {
      desc: "Infrastruktur finansial untuk kemandirian ekonomi individu.",
      privacy: "Kebijakan Privasi",
      terms: "Ketentuan Layanan",
    },
    legal: {
      privacyTitle: "Kebijakan Privasi",
      privacyDesc: "Bagaimana kami menjaga data finansial Anda tetap aman.",
      privacyContent:
        "Kami berkomitmen untuk melindungi privasi Anda. Seluruh data transaksi dienkripsi di sisi klien sebelum disimpan. Kami tidak membagikan data keuangan Anda kepada pihak ketiga manapun untuk tujuan periklanan atau data mining.",
      termsTitle: "Ketentuan Layanan",
      termsDesc: "Aturan main penggunaan platform Bujetsisa.",
      termsContent:
        "Dengan menggunakan Bujetsisa, Anda setuju untuk mengelola data finansial secara bertanggung jawab. Kami menyediakan alat untuk pencatatan, namun keputusan finansial tetap menjadi tanggung jawab pengguna sepenuhnya.",
    },
  },
  en: {
    nav: {
      features: "Features",
      pricing: "Pricing",
      faq: "FAQ",
      login: "Login",
      start: "Get Started",
    },
    hero: {
      badge: "Modern Financial Management System",
      title1: "Financial",
      title2: "Command.",
      desc: "Stop wondering where your money goes. Bujetsisa is an intelligent financial assistant helping you master cashflow.",
      cta: "Start Now",
    },
    features: {
      tag: "Core Capabilities",
      title: "Smart & Precise.",
      desc: "Advanced technology to monitor every cent you own.",
      f1_title: "Cashflow Analytics",
      f1_desc:
        "In-depth visualization that automatically breaks down your spending habits.",
      f2_title: "Strategic Goals",
      f2_desc:
        "Set and achieve your savings goals with accurate time predictions.",
      f3_title: "WhatsApp Billing",
      f3_desc:
        "Send debt reminders politely and automatically to your contacts.",
      f4_title: "Total Privacy",
      f4_desc:
        "Your data is fully encrypted. Only you have access to these reports.",
    },
    pricing: {
      title: "Invest in Future.",
      desc: "Choose the plan that fits your financial growth needs.",
      starter: {
        title: "Personal",
        desc: "Perfect for individuals starting their journey.",
        price: "Free",
        period: "Forever",
      },
      pro: {
        title: "Professional",
        desc: "Advanced automation for managing large assets.",
        price: "$1.2",
        period: "/ Month",
      },
      items: [
        "Analytics Dashboard",
        "Unlimited Ledger",
        "WhatsApp Sync",
        "Bank Reconciliation",
        "Pro Analytics",
      ],
      select: "Select Plan",
      soon: "Coming 2026",
    },
    faq: {
      title: "Inquiry.",
      q1: "Is my data truly secure?",
      a1: "Yes, we use AES-256 encryption and isolated Supabase databases for maximum security.",
      q2: "How does WhatsApp feature work?",
      a2: "The system prepares a professional message; you just click send via your WhatsApp.",
      q3: "Can I use multiple devices?",
      a3: "Yes, Bujetsisa is cloud-based; access it from any device in real-time.",
    },
    cta: { title1: "Ready to", title2: "Command?", join: "Join Now" },
    footer: {
      desc: "Financial infrastructure for economic independence.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
    legal: {
      privacyTitle: "Privacy Policy",
      privacyDesc: "How we keep your financial data protected.",
      privacyContent:
        "We are committed to protecting your privacy. All transaction data is encrypted. We do not share your financial data with any third parties for advertising or data mining purposes.",
      termsTitle: "Terms of Service",
      termsDesc: "Guidelines for using the Bujetsisa platform.",
      termsContent:
        "By using Bujetsisa, you agree to manage your financial data responsibly. While we provide the tools for tracking, all financial decisions remain the sole responsibility of the user.",
    },
  },
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any },
  },
};

export default function LandingPageClient() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [lang, setLang] = React.useState<"id" | "en">("id");
  const [openPrivacy, setOpenPrivacy] = React.useState(false);
  const [openTerms, setOpenTerms] = React.useState(false);
  const t = translations[lang];

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary selection:text-white overflow-x-hidden font-sans antialiased">
      {/* 0. BACKLIGHTS */}
      <div className="fixed top-[-5%] left-[-5%] size-[500px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 size-[400px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] dark:opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary z-[60] origin-left"
        style={{ scaleX }}
      />

      {/* 1. NAVIGATION */}
      <header className="px-6 lg:px-20 h-20 flex items-center border-b justify-between bg-background/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="bg-primary p-2 rounded-xl shadow-lg flex items-center justify-center"
          >
            <Coins className="text-primary-foreground size-6" />
          </motion.div>
          <span className="font-bold text-lg text-foreground">Bujetsisa</span>
        </div>

        <nav className="flex items-center gap-2 sm:gap-6">
          <div className="hidden lg:flex items-center gap-6 mr-4">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t.nav.features}
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t.nav.pricing}
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {t.nav.faq}
            </Link>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className="h-9 px-3"
          >
            {lang.toUpperCase()}
          </Button>

          <ThemeToggle />

          <Link href="/auth/login" className="hidden sm:block">
            <Button variant="ghost">{t.nav.login}</Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button>{t.nav.start}</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 relative z-10">
        {/* 2. HERO SECTION */}
        <section className="py-24 md:py-36 px-6 lg:px-20 text-center space-y-10 max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex justify-center"
          >
            <Badge
              variant="secondary"
              className="py-1.5 px-4 text-xs font-semibold"
            >
              {t.hero.badge}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] text-foreground"
          >
            {t.hero.title1}{" "}
            <span className="text-primary italic">{t.hero.title2}</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-muted-foreground text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
          >
            {t.hero.desc}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex justify-center pt-4"
          >
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="h-14 px-8 text-base font-semibold gap-3 rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {t.hero.cta} <ArrowRight className="size-5" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* 3. BENTO FEATURES */}
        <section
          id="features"
          className="py-24 px-6 lg:px-20 bg-muted/30 border-y"
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center space-y-3">
              <Badge
                variant="outline"
                className="text-primary border-primary/20 bg-primary/5"
              >
                {t.features.tag}
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                {t.features.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.features.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <BentoCard
                className="md:col-span-4"
                icon={<BarChart3 className="text-blue-500" />}
                title={t.features.f1_title}
                description={t.features.f1_desc}
                graphic={
                  <div className="mt-8 flex items-end gap-2 h-20 opacity-40">
                    {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500 rounded-t-sm"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                }
              />
              <BentoCard
                className="md:col-span-2"
                icon={<Target className="text-primary" />}
                title={t.features.f2_title}
                description={t.features.f2_desc}
              />
              <BentoCard
                className="md:col-span-3"
                icon={<MessageCircle className="text-green-600" />}
                title={t.features.f3_title}
                description={t.features.f3_desc}
              />
              <BentoCard
                className="md:col-span-3"
                icon={<Fingerprint className="text-orange-600" />}
                title={t.features.f4_title}
                description={t.features.f4_desc}
              />
            </div>
          </div>
        </section>

        {/* 4. PRICING */}
        <section id="pricing" className="py-24 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto text-center space-y-20">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                {t.pricing.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t.pricing.desc}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* STARTER */}
              <Card className="flex flex-col text-left hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>{t.pricing.starter.title}</CardTitle>
                  <CardDescription>{t.pricing.starter.desc}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="text-4xl font-bold">
                    {t.pricing.starter.price}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      {t.pricing.starter.period}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {t.pricing.items.slice(0, 3).map((item) => (
                      <PricingItem key={item} text={item} />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    {t.pricing.select}
                  </Button>
                </CardFooter>
              </Card>

              {/* PRO */}
              <Card className="flex flex-col text-left border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-primary">
                    {t.pricing.pro.title}
                  </CardTitle>
                  <CardDescription>{t.pricing.pro.desc}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                  <div className="text-4xl font-bold text-primary">
                    {t.pricing.pro.price}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      {t.pricing.pro.period}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {t.pricing.items.map((item) => (
                      <PricingItem key={item} text={item} />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" disabled>
                    {t.pricing.soon}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>

        {/* 5. FAQ */}
        <section id="faq" className="py-24 px-6 lg:px-20 bg-muted/30 border-y">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center text-foreground">
              {t.faq.title}
            </h2>
            <div className="grid gap-6">
              <FAQItem
                icon={<Lock className="text-blue-500" />}
                question={t.faq.q1}
                answer={t.faq.a1}
              />
              <FAQItem
                icon={<Globe className="text-purple-500" />}
                question={t.faq.q2}
                answer={t.faq.a2}
              />
              <FAQItem
                icon={<Receipt className="text-orange-500" />}
                question={t.faq.q3}
                answer={t.faq.a3}
              />
            </div>
          </div>
        </section>

        {/* 6. FINAL CTA */}
        <section className="py-32 px-6 lg:px-20 bg-primary text-primary-foreground text-center space-y-10 overflow-hidden relative">
          <Rocket className="absolute -left-10 -bottom-10 size-64 opacity-10 -rotate-12" />
          <div className="relative z-10 space-y-6">
            <motion.h2
              whileInView={{ scale: [0.98, 1], opacity: [0, 1] }}
              className="text-4xl md:text-7xl font-bold tracking-tight leading-none"
            >
              {t.cta.title1} <br /> {t.cta.title2}
            </motion.h2>
            <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto font-medium">
              Join thousands of users who have mastered their cashflow.
            </p>
            <div className="pt-4">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 text-lg font-semibold rounded-full shadow-xl"
                >
                  {t.cta.join} <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="pt-24 pb-12 border-t px-6 lg:px-20 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24 relative z-10 text-left">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl flex items-center justify-center shadow-lg">
                <Coins className="text-primary-foreground size-6" />
              </div>
              <span className="font-bold text-2xl text-foreground">
                Bujetsisa
              </span>
            </div>
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
              {t.footer.desc}
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </h4>
            <nav className="flex flex-col gap-4 text-sm font-medium text-foreground/80">
              <Link
                href="/dashboard"
                className="hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="#features"
                className="hover:text-primary transition-colors"
              >
                {t.nav.features}
              </Link>
              <Link
                href="#pricing"
                className="hover:text-primary transition-colors"
              >
                {t.nav.pricing}
              </Link>
            </nav>
          </div>
          <div className="space-y-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </h4>
            <nav className="flex flex-col gap-4 text-sm font-medium text-foreground/80">
              <button
                onClick={() => setOpenPrivacy(true)}
                className="text-left hover:text-primary transition-colors"
              >
                {t.footer.privacy}
              </button>
              <button
                onClick={() => setOpenTerms(true)}
                className="text-left hover:text-primary transition-colors"
              >
                {t.footer.terms}
              </button>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-t pt-12">
          <p className="text-xs text-muted-foreground">
            © 2026 Bujetsisa Labs.
          </p>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <ShieldCheck size={16} /> <span>Infrastructure by Supabase</span>
          </div>
        </div>
      </footer>

      {/* 8. LEGAL MODALS (PRIVACY & TERMS) */}
      <Dialog open={openPrivacy} onOpenChange={setOpenPrivacy}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <Badge variant="outline" className="w-fit mb-2">
              {t.nav.features}
            </Badge>
            <DialogTitle>{t.legal.privacyTitle}</DialogTitle>
            <DialogDescription>{t.legal.privacyDesc}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 prose prose-sm dark:prose-invert">
            <p className="text-foreground/80 leading-relaxed">
              {t.legal.privacyContent}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <Card>
                <CardContent className="p-6 space-y-2">
                  <Lock className="text-primary size-6" />
                  <h4 className="font-semibold text-sm">
                    End-to-End Encryption
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Your data is yours alone.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 space-y-2">
                  <ShieldCheck className="text-primary size-6" />
                  <h4 className="font-semibold text-sm">No Data Mining</h4>
                  <p className="text-xs text-muted-foreground">
                    We never sell your info.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openTerms} onOpenChange={setOpenTerms}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <Badge variant="outline" className="w-fit mb-2">
              {t.nav.features}
            </Badge>
            <DialogTitle>{t.legal.termsTitle}</DialogTitle>
            <DialogDescription>{t.legal.termsDesc}</DialogDescription>
          </DialogHeader>
          <div className="mt-4 prose prose-sm dark:prose-invert">
            <p className="text-foreground/80 leading-relaxed">
              {t.legal.termsContent}
            </p>
            <ul className="mt-6 space-y-3 list-none p-0">
              <li className="flex gap-3 text-sm items-start">
                <Check className="text-primary shrink-0 size-4 mt-0.5" /> User
                must be responsible for data entries.
              </li>
              <li className="flex gap-3 text-sm items-start">
                <Check className="text-primary shrink-0 size-4 mt-0.5" />{" "}
                Financial insights are for guidance only.
              </li>
              <li className="flex gap-3 text-sm items-start">
                <Check className="text-primary shrink-0 size-4 mt-0.5" />{" "}
                Bujetsisa is not a financial advisor.
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function BentoCard({
  title,
  description,
  icon,
  className,
  graphic,
  children,
}: any) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const onMouseMove = React.useCallback(
    ({ currentTarget, clientX, clientY }: any) => {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    },
    [mouseX, mouseY],
  );

  return (
    <Card
      onMouseMove={onMouseMove}
      className={`group relative overflow-hidden transition-all hover:shadow-lg ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
        }}
      />
      <CardContent className="h-full p-6 flex flex-col relative z-10">
        {icon && (
          <div className="p-3 bg-muted rounded-lg w-fit mb-4">
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, {
                  size: 24,
                })
              : icon}
          </div>
        )}
        <div className="space-y-2 mb-4">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        <div className="mt-auto">{graphic}</div>
        {children}
      </CardContent>
    </Card>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <CheckCircle2 className="text-primary size-4" />
      <span className="text-sm text-foreground/80 font-medium">{text}</span>
    </div>
  );
}

function FAQItem({ question, answer, icon }: any) {
  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-6 flex items-start gap-4">
        {icon && (
          <div className="p-2 bg-muted rounded-md shrink-0">
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<any>, {
                  size: 20,
                })
              : icon}
          </div>
        )}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">{question}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {answer}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
