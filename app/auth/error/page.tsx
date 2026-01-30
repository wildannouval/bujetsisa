import { IconAlertCircleFilled, IconCoin } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/80">
      Error Core: {params?.error || "Unknown Authentication Failure"}
    </p>
  );
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="w-full max-w-md">
      <div className="relative rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10 md:p-12 text-center space-y-8 shadow-2xl">
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl">
            <IconCoin className="text-white size-8" />
          </div>
          <div className="text-red-500">
            <IconAlertCircleFilled size={64} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
              System Error
            </h1>
            <Suspense
              fallback={
                <p className="text-xs text-slate-400">
                  Loading error details...
                </p>
              }
            >
              <ErrorContent searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
        <Link href="/auth/login" className="block">
          <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] border-none shadow-2xl shadow-indigo-500/20">
            Try Again
          </Button>
        </Link>
      </div>
    </div>
  );
}
