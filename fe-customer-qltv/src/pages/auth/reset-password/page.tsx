import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthBrand, AuthCard, AuthFooter, PasswordInput } from "@/features/auth/components";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

export function ResetPasswordPage() {
  const { t } = useTranslation("pages");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();

  useEffect(() => {
    if (!token) {
      toast.error(t("authReset.invalidToken"));
      navigate("/forgot-password");
    }
  }, [token, navigate, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(t("authReset.mismatch"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("authReset.minLength"));
      return;
    }

    if (!token) {
      toast.error(t("authReset.invalidToken"));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({ token, newPassword: password });
      setIsSuccess(true);
      toast.success(t("authReset.successToast"));
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (err.response?.status === 401) {
        toast.error(t("authReset.tokenExpired"));
      } else {
        toast.error(
          err.response?.data?.message || t("authReset.genericError"),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <AuthBrand />

      <AuthCard>
        
        <div className="px-10 pt-12 pb-8 text-center">
          {isSuccess ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" strokeWidth={2} />
                </div>
              </div>
              <h1 className="text-2xl font-black text-foreground leading-tight mb-3 tracking-tight">
                {t("authReset.successTitle")}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("authReset.successDesc")}
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-black text-foreground leading-tight mb-3 tracking-tight">
                {t("authReset.formTitle")}
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t("authReset.formDesc")}
              </p>
            </>
          )}
        </div>

        
        {!isSuccess && (
          <div className="px-10 pb-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <PasswordInput
                label={t("authReset.newPassword")}
                id="password"
                placeholder={t("authReset.newPasswordPh")}
                value={password}
                onChange={setPassword}
                required
              />

              <div className="space-y-2.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary"
                >
                  {t("authReset.confirmLabel")}
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" strokeWidth={2} />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t("authReset.confirmPh")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 h-14 bg-muted border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary/30 focus:shadow-[0_0_0_4px_rgba(24,173,91,0.1)] transition-all duration-300 text-foreground text-sm placeholder:text-muted-foreground font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-300"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{t("authReset.submit")}</span>
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </>
                  )}
                </Button>
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-muted-foreground hover:text-primary font-semibold transition-colors duration-200 rounded-2xl hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                  <span>{t("authForgot.backLogin")}</span>
                </Link>
              </div>
            </form>
          </div>
        )}

        
        {isSuccess && (
          <div className="px-10 pb-10">
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-3.5 text-primary-foreground bg-primary hover:bg-primary/90 font-bold transition-colors duration-200 rounded-2xl shadow-lg shadow-primary/25"
              >
                <span>{t("authReset.loginNow")}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </AuthCard>

      <AuthFooter />
    </div>
  );
}