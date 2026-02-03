import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";
import Link from "next/link";
import { Banknote } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-svh flex flex-col">
      {/* Header */}
      <header className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <Banknote className="h-4 w-4" />
          </div>
          <span className="font-bold text-xl">BujetSisa</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-10 bg-gradient-to-b from-background to-muted/20">
        <div className="w-full max-w-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
