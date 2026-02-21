import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export default function Card({
  children,
  className = "",
  hover = true,
  padding = "md",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm overflow-hidden ${
        hover
          ? "transition-all duration-300 hover:border-[#7F00FF]/30 hover:bg-[#181A20]/85"
          : ""
      } ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
