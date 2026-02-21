import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  className?: string;
}

const selectBase =
  "w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 text-sm text-white transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20";

export default function Select({
  label,
  options,
  placeholder = "Seleccionar",
  id,
  className = "",
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <div>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-semibold text-[#EAECEF]"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`${selectBase} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
