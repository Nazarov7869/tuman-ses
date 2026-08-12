import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, KeyRound, UserCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { changePassword, getMe } from "@/lib/authApi";
import { ApiError } from "@/lib/api";
import { logError } from "@/lib/logger";

const roleLabels: Record<string, string> = {
  main: "Bosh admin",
  qabul: "Qabul",
  payment: "To'lovlar",
  registrants: "Ro'yxatdan o'tganlar",
};

const Settings = () => {
  const [email, setEmail] = useState(localStorage.getItem("adminEmail") || "");
  const [role, setRole] = useState(localStorage.getItem("adminRole") || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getMe()
      .then((me) => {
        setEmail(me.email);
        if (me.role) setRole(me.role);
      })
      .catch((error) => logError("Error fetching profile:", error));
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: "Xato",
        description: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Xato",
        description: "Yangi parollar bir-biriga mos kelmadi",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast({
        title: "Muvaffaqiyatli",
        description: "Parolingiz o'zgartirildi",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Parolni o'zgartirishda xatolik";
      toast({ title: "Xato", description: message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout title="Sozlamalar" subtitle="Profil va xavfsizlik sozlamalari">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Profil
            </CardTitle>
            <CardDescription>Hisobingiz haqida ma'lumot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Elektron pochta</Label>
              <Input value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Input value={roleLabels[role] || role} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Parolni o'zgartirish
            </CardTitle>
            <CardDescription>Xavfsizlik uchun kuchli parol tanlang</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Joriy parol</Label>
                <Input
                  id="current-password"
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Yangi parol</Label>
                <Input
                  id="new-password"
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Yangi parolni tasdiqlang</Label>
                <Input
                  id="confirm-password"
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSaving}
                  required
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPasswords ? "Parollarni yashirish" : "Parollarni ko'rsatish"}
              </button>
              <div>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saqlanmoqda...
                    </>
                  ) : (
                    "Parolni saqlash"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;
