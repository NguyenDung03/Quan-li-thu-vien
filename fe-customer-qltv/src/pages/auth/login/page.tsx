import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { Book, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isAxiosError } from "axios";

function loginErrorMessage(
  error: unknown,
  defaultMsg: string,
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;
    if (typeof data?.message === "string") return data.message;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (typeof data?.error === "string") return data.error;
  }
  if (error instanceof Error && error.message) return error.message;
  return defaultMsg;
}

export function LoginPage() {
  const { t } = useTranslation("pages");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      await login({ username: email, password });
      toast.success(t("authLogin.success"));
      navigate("/");
    } catch (error: unknown) {
      const msg = loginErrorMessage(error, t("loginErrors.default"));
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-[162px] bg-background">
      
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] max-w-[1024px] w-full overflow-hidden">
        <div className="flex">
          
          <div className="bg-[#ccfdd9] flex-1 p-12 flex flex-col justify-between min-h-[600px] relative overflow-hidden">
            
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="bg-[#00b760] blur-[32px] w-full h-full rounded-[9999px]" />
            </div>

            
            <div className="relative">
              
              <div className="flex items-center gap-3 mb-[80px]">
                <div className="bg-[#00b760] w-12 h-12 rounded-xl flex items-center justify-center shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]">
                  <Book className="w-6 h-6 text-white" />
                </div>
                <span className="font-black text-[#001f03] text-2xl tracking-[-0.6px]">
                  EduLib
                </span>
              </div>

              
              <div className="mb-[194px]">
                <h1 className="font-black text-[#001f03] text-[36px] leading-[45px] mb-0">
                  {t("authShared.headline1")}
                </h1>
                <h1 className="font-black text-[#001f03] text-[36px] leading-[45px]">
                  {t("authShared.headline2")}
                </h1>
              </div>

              
              <div className="max-w-[320px] opacity-90">
                <p className="font-medium text-[#002e05] text-lg leading-7 mb-0">
                  {t("authShared.desc1")}
                </p>
                <p className="font-medium text-[#002e05] text-lg leading-7 mb-0">
                  {t("authShared.desc2")}
                </p>
                <p className="font-medium text-[#002e05] text-lg leading-7">
                  {t("authShared.desc3")}
                </p>
              </div>
            </div>

            
            <div className="relative pt-[165px]">
              <div className="backdrop-blur-sm bg-white/30 border border-white/40 rounded-xl p-4 flex items-center gap-4">
                
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-[#55c97f] flex items-center justify-center">
                    <span className="font-bold text-white text-xs">+2k</span>
                  </div>
                </div>
                <span className="font-semibold text-[#001f03] text-sm">
                  {t("authShared.onlineWithYou")}
                </span>
              </div>
            </div>
          </div>

          
          <div className="flex-1 p-16 flex flex-col justify-center">
            
            <div className="pb-10">
              <h2 className="font-black text-[#001321] text-[30px] leading-9 mb-2">
                {t("authLogin.title")}
              </h2>
              <p className="font-medium text-[#3e5667] text-base leading-6">
                {t("authLogin.subtitle")}
              </p>
            </div>

            
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                >
                  {formError}
                </div>
              ) : null}
              
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="font-bold text-[#00b760] text-xs tracking-[1.2px] uppercase"
                >
                  {t("authLogin.emailLabel")}
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Mail className="w-5 h-5 text-[#94a3b8]" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@student.school.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormError(null);
                    }}
                    className="h-[52px] bg-[#e6f4fe] pl-12 pr-4 rounded-xl text-base font-medium placeholder:text-[#94a3b8] border-0 focus-visible:ring-2 focus-visible:ring-[#00b760]/20"
                    required
                  />
                </div>
              </div>

              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="font-bold text-[#00b760] text-xs tracking-[1.2px] uppercase"
                  >
                    {t("authLogin.passwordLabel")}
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="font-bold text-[#3e5667] text-xs hover:text-[#00b760] transition-colors"
                  >
                    {t("authPassword.forgot")}
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Lock className="w-5 h-5 text-[#94a3b8]" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError(null);
                    }}
                    className="h-[52px] bg-[#e6f4fe] pl-12 pr-12 rounded-xl text-base font-medium placeholder:text-[#94a3b8] border-0 focus-visible:ring-2 focus-visible:ring-[#00b760]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#00b760] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-[#00b760] hover:bg-[#00a654] text-white font-bold rounded-xl shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t("authLogin.submit")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            
            <div className="pt-10 mt-10 border-t border-[#e5e7eb]">
              <p className="text-center text-[#3e5667] text-sm">
                <span className="font-medium">{t("authLogin.noAccount")}</span>
                <Link
                  to="/register"
                  className="font-bold text-[#00b760] hover:underline ml-1"
                >
                  {t("authLogin.register")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}