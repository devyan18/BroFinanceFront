interface PageSectionProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageSection({
  title,
  description,
  children,
  className = "",
}: PageSectionProps) {
  return (
    <div className={className}>
      <div className="mb-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-[#848E9C]">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
