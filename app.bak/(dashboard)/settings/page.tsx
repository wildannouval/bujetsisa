import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount } from "@/lib/actions/profile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarPicker } from "@/components/avatar-picker";
import { ProfileForm } from "@/components/profile-form";
import { PasswordForm } from "@/components/password-form";
import { NotificationForm } from "@/components/notification-form";

async function SettingsContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>
      </div>
      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your public profile information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <AvatarPicker
                url={profile?.avatar_url}
                username={profile?.username || "user"}
              />
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Profile Picture</h4>
                <p className="text-xs text-muted-foreground">
                  Click the avatar to change it.
                </p>
              </div>
            </div>
            <Separator />
            <ProfileForm user={user} profile={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationForm profile={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Update your password and secure your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/10">
              <div className="space-y-1">
                <p className="font-medium text-destructive">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data.
                </p>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteAccount();
                }}
              >
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 flex md:flex">
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
