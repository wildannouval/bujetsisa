"use client";

import { useTranslation } from "@/hooks/use-translation";
import { useTheme } from "next-themes";
import { AvatarPicker } from "@/components/avatar-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User,
  Palette,
  Shield,
  Download,
  Moon,
  Sun,
  Globe,
  Mail,
  Lock,
  FileText,
  Trash2,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  changePassword,
  exportUserData,
  deleteUserAccount,
} from "@/lib/actions/settings";

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const { setTheme, theme } = useTheme();
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Password dialog state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Export state
  const [exportLoading, setExportLoading] = useState(false);

  // Delete account state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setAvatar(user.user_metadata?.avatar_url || "");
        setName(user.user_metadata?.name || "");
        setEmail(user.email || "");
        setCreatedAt(user.created_at || null);
      }
    };
    getUser();
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatar,
          name: name,
        },
      });

      if (error) throw error;

      toast.success(t.settings.profile_updated);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast.error(
        t.settings.current_password_required ||
          "Kata sandi saat ini wajib diisi",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.settings.password_mismatch);
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t.settings.password_too_short);
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.settings.password_changed);
        setPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const result = await exportUserData();
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        // Create and download JSON file
        const dataStr = JSON.stringify(result.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `bujetsisa-export-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(t.settings.export_success);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error(t.settings.delete_confirm_error);
      return;
    }

    setDeleteLoading(true);
    try {
      const result = await deleteUserAccount();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.settings.account_deleted);
        await supabase.auth.signOut();
        router.push("/auth/login");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex-1 space-y-4 p-3 pt-4 sm:space-y-6 sm:p-4 sm:pt-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            {t.settings.title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t.settings.manage_settings}
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full overflow-x-auto flex justify-start gap-1 p-1 h-auto sm:grid sm:grid-cols-4 sm:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{t.settings.profile}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">{t.settings.appearance}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">{t.settings.security}</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{t.settings.data}</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t.settings.profile}
              </CardTitle>
              <CardDescription>{t.settings.profile_desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
                <AvatarPicker
                  currentAvatar={avatar}
                  onAvatarChange={(url) => setAvatar(url)}
                />
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-semibold text-lg">{name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {t.settings.member_since} {formatDate(createdAt)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.settings.name_label}</Label>
                  <Input
                    id="name"
                    placeholder={t.settings.name_placeholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.settings.email_label}</Label>
                  <Input
                    id="email"
                    placeholder="email@example.com"
                    value={email}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.settings.email_cannot_change}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? t.common.loading : t.common.save}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t.settings.appearance}
              </CardTitle>
              <CardDescription>{t.settings.appearance_desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    {theme === "dark" ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>{t.settings.theme_label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.theme_desc}
                    </p>
                  </div>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      {t.settings.light_mode}
                    </SelectItem>
                    <SelectItem value="dark">{t.settings.dark_mode}</SelectItem>
                    <SelectItem value="system">
                      {t.settings.system_mode}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Language */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t.settings.language}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.language_desc}
                    </p>
                  </div>
                </div>
                <Select
                  value={language}
                  onValueChange={(val: any) => setLanguage(val)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">🇮🇩 Indonesia</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t.settings.security}
              </CardTitle>
              <CardDescription>{t.settings.security_desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t.settings.email_label}</Label>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-green-500 text-green-600"
                >
                  {t.settings.verified}
                </Badge>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t.settings.password_label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.password_desc}
                    </p>
                  </div>
                </div>
                <Dialog
                  open={passwordDialogOpen}
                  onOpenChange={setPasswordDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      {t.settings.change_password}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.settings.change_password}</DialogTitle>
                      <DialogDescription>
                        {t.settings.change_password_desc}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">
                          {t.settings.current_password}
                        </Label>
                        <div className="relative">
                          <Input
                            id="current-password"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">
                          {t.settings.new_password}
                        </Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          {t.settings.confirm_password}
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setPasswordDialogOpen(false)}
                      >
                        {t.common.cancel}
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t.common.loading}
                          </>
                        ) : (
                          t.common.save
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Logout */}
              <Separator />
              <div className="flex items-center justify-between rounded-lg border border-red-200 p-4 dark:border-red-900/30">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                    <LogOut className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t.settings.logout}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.logout_desc}
                    </p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  {t.settings.logout}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                {t.settings.data}
              </CardTitle>
              <CardDescription>{t.settings.data_desc}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export Data */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t.settings.export_data}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.export_data_desc}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {t.settings.export}
                </Button>
              </div>

              {/* Delete Account */}
              <Separator />
              <div className="rounded-lg border border-red-200 p-4 dark:border-red-900/30">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/20">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-red-600">
                      {t.settings.delete_account}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.delete_account_desc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        {t.settings.delete_account}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t.settings.delete_account_title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.settings.delete_account_warning}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          {t.settings.delete_confirm_instruction}
                        </p>
                        <Input
                          placeholder="DELETE"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setDeleteConfirmText("")}
                        >
                          {t.common.cancel}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={
                            deleteLoading || deleteConfirmText !== "DELETE"
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {t.common.loading}
                            </>
                          ) : (
                            t.settings.delete_account
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
