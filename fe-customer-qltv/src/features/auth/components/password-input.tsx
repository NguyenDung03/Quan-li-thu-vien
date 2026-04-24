import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  label: string;
  id: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  showForgotPassword?: boolean;
  forgotPasswordLink?: string;
  required?: boolean;
  className?: string;
}

export function PasswordInput({
  label,
  id,
  placeholder,
  value,
  onChange,
  showForgotPassword = false,
  forgotPasswordLink,
  required = false,
  className,
}: PasswordInputProps) {
  const { t } = useTranslation("pages");
  const [showPassword, setShowPassword] = useState(false);
  const resolvedPlaceholder = placeholder ?? t("authPassword.placeholder");

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center justify-between">
        <Label
          htmlFor={id}
          className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary"
        >
          {label}
        </Label>
        {showForgotPassword && forgotPasswordLink && (
          <a
            href={forgotPasswordLink}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {t("authPassword.forgot")}
          </a>
        )}
      </div>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <Lock
            className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors"
            strokeWidth={2}
          />
        </div>
        <Input
          id={id}
          name={id}
          type={showPassword ? "text" : "password"}
          placeholder={resolvedPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-12 pr-14 h-14 bg-muted border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white focus:border-primary/30 focus:shadow-[0_0_0_4px_rgba(24,173,91,0.1)] transition-all duration-300 text-foreground text-sm placeholder:text-muted-foreground font-medium"
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" strokeWidth={2} />
          ) : (
            <Eye className="h-5 w-5" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
