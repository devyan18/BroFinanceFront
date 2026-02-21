interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "size-6 border-2",
  md: "size-8 border-2",
  lg: "size-12 border-2",
};

export default function Spinner({
  size = "md",
  className = "",
}: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-[#2B3139] border-t-[#7F00FF] ${sizeStyles[size]} ${className}`}
      aria-label="Cargando"
    />
  );
}
