import type { ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "pay"
  | "outline-danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#7F00FF] to-[#9D00FF] text-white shadow-md shadow-[#7F00FF]/15 hover:shadow-lg hover:shadow-[#7F00FF]/25",
  secondary:
    "border border-[#2B3139]/60 bg-transparent text-white hover:bg-[#2B3139]/40",
  ghost: "bg-transparent text-white hover:bg-[#2B3139]/40",
  danger:
    "bg-[#F6465D] text-white hover:bg-[#CF304A] disabled:bg-[#2B3139] disabled:text-[#848E9C]",
  success:
    "bg-[#0ECB81] text-[#0B0E11] hover:bg-[#03A66D]",
  pay: "bg-[#009EE3]/20 text-[#009EE3] hover:bg-[#009EE3]/30",
  "outline-danger":
    "border border-[#F6465D]/50 text-[#F6465D] hover:bg-[#F6465D]/10",
};

const sizeStyles = {
  sm: "px-2 py-1 text-[10px]",
  md: "px-3 py-1.5 text-xs",
  lg: "px-4 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "rounded-lg font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:pointer-events-none inline-flex items-center justify-center gap-1.5";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
}
