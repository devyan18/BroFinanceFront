import { IoWarningOutline } from "react-icons/io5";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  icon?: React.ReactNode;
  className?: string;
  role?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  error:
    "border border-[#F6465D]/30 bg-[#F6465D]/10 text-[#F6465D]",
  success:
    "border border-[#0ECB81]/20 bg-[#0ECB81]/10 text-[#0ECB81]",
  warning:
    "border border-amber-500/30 bg-amber-500/10 text-amber-500",
  info: "border border-[#7F00FF]/30 bg-[#7F00FF]/10 text-[#7F00FF]",
};

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  error: <IoWarningOutline className="size-4 shrink-0" />,
  success: <IoCheckmarkCircleOutline className="size-4 shrink-0" />,
  warning: <IoWarningOutline className="size-4 shrink-0" />,
  info: <IoWarningOutline className="size-4 shrink-0" />,
};

export default function Alert({
  children,
  variant = "error",
  icon,
  className = "",
  role = "alert",
}: AlertProps) {
  return (
    <div
      role={role}
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs ${variantStyles[variant]} ${className}`}
    >
      {icon ?? defaultIcons[variant]}
      <span>{children}</span>
    </div>
  );
}
