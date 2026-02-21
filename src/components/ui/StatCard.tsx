import Card from "./Card";
import { formatMoney } from "../../utils/formatters";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  positive?: boolean;
  neutral?: boolean;
  animationDelay?: number;
  style?: React.CSSProperties;
}

export default function StatCard({
  label,
  value,
  icon,
  positive = false,
  neutral = false,
  animationDelay = 0,
  style,
  ...props
}: StatCardProps) {
  const valueColor = neutral
    ? "text-[#848E9C]"
    : positive
      ? "text-[#0ECB81]"
      : "text-[#F6465D]";
  const iconBg = neutral
    ? "bg-[#848E9C]/15 text-[#848E9C]"
    : positive
      ? "bg-[#0ECB81]/15 text-[#0ECB81]"
      : "bg-[#F6465D]/15 text-[#F6465D]";

  return (
    <Card
      className="group relative"
      style={{ animation: "fadeInUp 0.4s ease-out both", animationDelay: `${animationDelay}ms`, ...style }}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#7F00FF]/0 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:from-[#7F00FF]/[0.03]" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E9C]">
            {label}
          </span>
          <div className={`rounded-md p-1 ${iconBg}`}>{icon}</div>
        </div>
        <p className={`font-mono text-xl font-semibold tabular-nums tracking-tight ${valueColor}`}>
          {typeof value === "number" ? formatMoney(value) : value}
        </p>
      </div>
    </Card>
  );
}
