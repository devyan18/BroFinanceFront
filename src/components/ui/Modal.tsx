import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  closeDisabled?: boolean;
  maxWidth?: "sm" | "md" | "lg";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  closeDisabled = false,
  maxWidth = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClass = maxWidth === "sm" ? "max-w-sm" : maxWidth === "lg" ? "max-w-lg" : "max-w-md";

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.2s ease-out" }}
        onClick={() => !closeDisabled && onClose()}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`fixed left-1/2 top-1/2 z-50 w-full ${maxWidthClass} -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-[#2B3139]/60 bg-[#181A20]/95 backdrop-blur-xl shadow-2xl`}
        style={{ animation: "scaleIn 0.2s ease-out" }}
      >
        <div className="flex items-center justify-between border-b border-[#2B3139]/60 px-5 py-3">
          <h3 id="modal-title" className="text-base font-semibold">
            {title}
          </h3>
          <button
            type="button"
            onClick={() => !closeDisabled && onClose()}
            disabled={closeDisabled}
            className="rounded-lg p-1 text-[#848E9C] transition-colors hover:bg-[#2B3139] hover:text-white disabled:opacity-50"
          >
            <IoClose className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
