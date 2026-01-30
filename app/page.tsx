import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LandingPageClient from "@/components/landing-page-client";

export default async function Page() {
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
