import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-[#2B3139]/50 bg-[#181A20]/50 py-16 text-center ${className}`}
    >
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-[#2B3139]/50">
        {icon}
      </div>
      <p className="mb-1 text-base font-semibold">{title}</p>
      {description && (
        <p className="mb-3 text-xs text-[#848E9C]">{description}</p>
      )}
      {action}
    </div>
  );
}
