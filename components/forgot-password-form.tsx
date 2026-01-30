"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconCoin,
  IconArrowRight,
  IconMail,
  IconChevronLeft,
  IconCircleCheckFilled,
  IconShieldLock,
} from "@tabler/icons-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = React.useCallback(
    ({ currentTarget, clientX, clientY }: React.MouseEvent) => {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    },
    [mouseX, mouseY],
  );

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-6 w-full max-w-[450px] relative z-10",
        className,
      )}
      {...props}
    >
      <Link
        href="/auth/login"
        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors mb-2 w-fit"
      >
        <IconChevronLeft
          size={14}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Login
      </Link>

      <motion.div
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-3xl p-8 md:p-12 overflow-hidden shadow-2xl transition-all duration-700 hover:border-indigo-500/40"
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
          }}
        />

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl">
              <IconCoin className="text-white size-8" />
            </div>

            {success ? (
              <div className="space-y-4">
                <div className="flex justify-center text-green-400">
                  <IconCircleCheckFilled size={48} />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
                    Check Your Inbox
                  </h1>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 leading-relaxed">
                    Recovery instructions have been dispatched to your email
                    address.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                  Reset Access
                </h1>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Enter email to recover account
                </p>
              </div>
            )}
          </div>

          {!success && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">
                  Registered Email
                </Label>
                <div className="relative">
                  <IconMail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="commander@domain.com"
                    className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-[10px] font-bold uppercase text-red-400 text-center tracking-widest">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl border-none transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Dispatching..." : "Send Reset Link"}
                {!isLoading && <IconArrowRight className="ml-2 size-4" />}
              </Button>
            </form>
          )}

          {success && (
            <Link href="/auth/login" className="block">
              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black"
              >
                Return to Login
              </Button>
            </Link>
          )}

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
              Secured by Supabase Identity Engine
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
