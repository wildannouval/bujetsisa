"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconCoin,
  IconArrowRight,
  IconUserPlus,
  IconChevronLeft,
  IconShieldCheck,
} from "@tabler/icons-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [repeatPassword, setRepeatPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setError("Passcodes do not match");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: any) {
      setError(error.message || "Registration failed");
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
        href="/"
        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors mb-4 w-fit"
      >
        <IconChevronLeft
          size={14}
          className="group-hover:-translate-x-1 transition-transform"
        />
        Back to Headquarters
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
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/40">
              <IconCoin className="text-white size-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                Create Unit
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Join the financial ecosystem
              </p>
            </div>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Email Address
              </Label>
              <Input
                type="email"
                placeholder="commander@domain.com"
                className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Access Key (Min 6 Chars)
              </Label>
              <Input
                type="password"
                placeholder="Your secret key"
                className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                Verify Key
              </Label>
              <Input
                type="password"
                placeholder="Repeat secret key"
                className="h-14 bg-white/5 border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500/50"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-[10px] font-bold uppercase text-red-400 text-center tracking-widest">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-500/20 border-none transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Deploy Profile"}
              {!isLoading && <IconUserPlus className="ml-2 size-4" />}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Already enlisted?{" "}
              <Link
                href="/auth/login"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Login Now
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
