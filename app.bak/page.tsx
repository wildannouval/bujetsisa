import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { unstable_noStore } from "next/cache";
import LandingPageClient from "@/components/landing-page-client";

export default async function Page() {
  // Opt into dynamic rendering for auth check
  unstable_noStore();
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect secepat mungkin di sisi server jika sudah login
  if (user) {
    redirect("/dashboard");
  }

  return <LandingPageClient />;
}
