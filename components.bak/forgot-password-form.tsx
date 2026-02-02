"use client";

import * as React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Coins,
  Loader2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
      toast.success("Recovery email sent!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
            <Coins className="size-6 text-primary" />
          </div>
          <CardTitle className="text-xl">
            {success ? "Check your inbox" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {success
              ? "We've sent you a recovery link to your email."
              : "Enter your email address to recover your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4">
              <CheckCircle2 className="size-16 text-green-500" />
              <Button asChild className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      className="pl-9"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending link...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="text-center text-sm text-muted-foreground justify-center">
            <Link
              href="/auth/login"
              className="flex items-center hover:text-primary transition-colors"
            >
              <ChevronLeft className="mr-2 size-4" />
              Back to Login
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
