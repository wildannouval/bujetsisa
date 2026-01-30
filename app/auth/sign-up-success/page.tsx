import { IconCircleCheckFilled, IconCoin } from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignUpSuccessPage() {
  return (
    <div className="w-full max-w-md">
      <div className="relative rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-10 md:p-12 text-center space-y-8 shadow-2xl">
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl">
            <IconCoin className="text-white size-8" />
          </div>
          <div className="text-green-400">
            <IconCircleCheckFilled size={64} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
              Check Your Email
            </h1>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
              We&apos;ve sent a verification link to your unit. Deploy your
              account by clicking the link.
            </p>
          </div>
        </div>
        <Link href="/auth/login" className="block">
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-all"
          >
            Return to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
