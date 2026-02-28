import { useState } from "react";
import { Link } from "wouter";
import {
  IoChevronDown,
  IoPersonOutline,
  IoBarChartOutline,
  IoLogOutOutline,
} from "react-icons/io5";
import { formatMoney } from "../../utils/formatters";
import Avatar from "../ui/Avatar";
import { getAvatarUrl } from "../../utils/avatar";
import type { User } from "../../types/auth";

interface NavItem {
  href: string;
  label: string;
}

interface NavbarProps {
  user: User | null | undefined;
  balance?: number;
  onLogout: () => void;
  navItems?: NavItem[];
  currentPath?: string;
  maxWidth?: "7xl" | "3xl" | "5xl";
}

function Logo() {
  return (
    <Link
      href="/inicio"
      className="flex items-center gap-2 text-base font-semibold tracking-tight text-white transition-opacity hover:opacity-80"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7F00FF] to-[#9D00FF]">
        <span className="text-xs font-bold">BF</span>
      </div>
      Bro Finances
    </Link>
  );
}

export default function Navbar({
  user,
  balance = 0,
  onLogout,
  navItems = [
    { href: "/inicio", label: "Inicio" },
    { href: "/amigos", label: "Amigos" },
    { href: "/charts", label: "Gráficas" },
  ],
  currentPath = "/inicio",
  maxWidth = "7xl",
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const maxWidthClass = maxWidth === "7xl" ? "max-w-7xl" : maxWidth === "3xl" ? "max-w-3xl" : "max-w-5xl";

  return (
    <header className="sticky top-0 z-50 border-b border-[#2B3139]/60 bg-[#181A20]/80 backdrop-blur-xl">
      <div
        className={`mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 ${maxWidthClass}`}
      >
        <div className="flex items-center gap-6">
          <Logo />
          {navItems.length > 0 && (
            <nav className="hidden sm:flex items-center gap-0.5">
              {navItems.map((item) => {
                const active = currentPath === item.href || (item.href !== "/inicio" && currentPath.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-[#2B3139]/60 text-white"
                        : "text-[#848E9C] hover:bg-[#2B3139]/40 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          {balance !== undefined && navItems.length > 0 && (
            <div className="hidden sm:flex h-9 min-w-[120px] items-center justify-between gap-2 rounded-lg border border-[#2B3139]/50 bg-[#0B0E11]/40 px-3 backdrop-blur-sm">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#848E9C]">
                Saldo
              </span>
              <span
                className={`font-mono text-xs font-semibold tabular-nums ${
                  balance >= 0 ? "text-[#0ECB81]" : "text-[#F6465D]"
                }`}
              >
                {formatMoney(balance)}
              </span>
            </div>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 min-w-[120px] items-center gap-2 rounded-lg border border-[#2B3139]/50 bg-[#0B0E11]/40 px-3 backdrop-blur-sm transition-all hover:bg-[#2B3139]/40"
              aria-label="Menú de usuario"
              aria-expanded={menuOpen}
            >
              <Avatar
                name={user?.username ?? "U"}
                src={getAvatarUrl(user?.avatarUrl)}
                size="sm"
                variant="default"
              />
              <span className="hidden sm:block truncate text-xs font-medium max-w-[72px]">
                {user?.username}
              </span>
              <IoChevronDown className="size-4 text-[#848E9C]" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden
                />
                <div
                  className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-lg border border-[#2B3139]/60 bg-[#181A20]/95 backdrop-blur-xl shadow-2xl"
                  style={{ animation: "slideDown 0.2s ease-out" }}
                >
                  <div className="border-b border-[#2B3139]/50 bg-[#0B0E11]/30 px-3 py-2.5">
                    <p className="font-semibold text-xs">{user?.username}</p>
                    <p className="text-[11px] text-[#848E9C] mt-0.5 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <nav className="p-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded px-2.5 py-2 text-xs font-medium transition-colors hover:bg-[#2B3139]/50"
                    >
                      <IoPersonOutline className="size-3.5 text-[#848E9C]" />
                      Mi perfil
                    </Link>
                    <Link
                      href="/charts"
                      className="flex items-center gap-2 rounded px-2.5 py-2 text-xs font-medium transition-colors hover:bg-[#2B3139]/50"
                    >
                      <IoBarChartOutline className="size-3.5 text-[#848E9C]" />
                      Gráficas
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-xs font-medium text-[#F6465D] transition-colors hover:bg-[#F6465D]/10"
                    >
                      <IoLogOutOutline className="size-3.5" />
                      Cerrar sesión
                    </button>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
