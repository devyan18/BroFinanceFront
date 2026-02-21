import { getInitials } from "../../utils/formatters";

type AvatarVariant = "positive" | "negative" | "default";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  variant?: AvatarVariant;
  className?: string;
  ring?: boolean;
}

const sizeStyles = {
  sm: "size-6 text-[10px]",
  md: "size-9 text-[10px]",
  lg: "size-10 text-sm",
};

const variantStyles: Record<AvatarVariant, { bg: string; ring: string }> = {
  positive: { bg: "bg-[#0ECB81]/20 text-[#0ECB81]", ring: "ring-[#0ECB81]" },
  negative: { bg: "bg-[#F6465D]/20 text-[#F6465D]", ring: "ring-[#F6465D]" },
  default: { bg: "bg-gradient-to-br from-[#7F00FF] to-[#9D00FF] text-white", ring: "ring-transparent" },
};

export default function Avatar({
  name,
  src,
  size = "md",
  variant = "default",
  className = "",
  ring = false,
}: AvatarProps) {
  const sizeClass = sizeStyles[size];
  const { bg, ring: ringColor } = variantStyles[variant];

  if (src) {
    return (
      <img
        key={src}
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeClass} ${ring ? `ring-2 ${ringColor}` : ""} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${sizeClass} ${bg} ${ring ? `ring-2 ${ringColor}` : ""} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
