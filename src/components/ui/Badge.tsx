type BadgeVariant = "default" | "primary" | "positive" | "negative" | "pending";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[#2B3139]/60 text-[#848E9C]",
  primary: "bg-[#7F00FF]/20 text-[#7F00FF]",
  positive: "bg-[#0ECB81]/15 text-[#0ECB81]",
  negative: "bg-[#F6465D]/15 text-[#F6465D]",
  pending: "bg-[#7F00FF]/20 text-[#7F00FF]",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
