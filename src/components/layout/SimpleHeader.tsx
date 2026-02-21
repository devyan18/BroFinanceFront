interface SimpleHeaderProps {
  onLogout?: () => void;
  logoutLabel?: string;
  children?: React.ReactNode;
}

function Logo() {
  return (
    <a
      href="/inicio"
      className="flex items-center gap-2 text-base font-semibold tracking-tight text-white transition-opacity hover:opacity-80"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7F00FF] to-[#9D00FF]">
        <span className="text-xs font-bold">BF</span>
      </div>
      Bro Finances
    </a>
  );
}

export default function SimpleHeader({
  onLogout,
  logoutLabel = "Salir",
  children,
}: SimpleHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#2B3139]/60 bg-[#181A20]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Logo />
        {children !== undefined ? (
          children
        ) : onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="h-9 rounded-lg border border-[#2B3139]/50 bg-[#0B0E11]/40 px-3 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-[#2B3139]/40"
            >
              {logoutLabel}
            </button>
        ) : null}
      </div>
    </header>
  );
}
