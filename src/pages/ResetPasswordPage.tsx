import { useState, useEffect } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { IoWarningOutline, IoCheckmarkCircleOutline, IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import api from "../services/api.service";

const inputClass =
  "w-full h-10 rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 text-sm text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";
  const userId = params.get("userId") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !userId) setError("Enlace inválido. Solicitá uno nuevo.");
  }, [token, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword(userId, token, newPassword);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0B0E11] text-white">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `linear-gradient(to right, #181A20 1px, transparent 1px), linear-gradient(to bottom, #181A20 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#7F00FF] rounded-full filter blur-[128px] opacity-20 -z-10" />

      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-white hover:opacity-80 transition-opacity">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7F00FF] to-[#9D00FF]">
                <span className="text-xs font-bold">BF</span>
              </div>
              Bro Finances
            </Link>
          </div>

          <div className="rounded-xl border border-[#2B3139]/50 bg-[#181A20]/80 backdrop-blur-sm p-6 shadow-2xl">
            {done ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <IoCheckmarkCircleOutline className="size-14 text-[#0ECB81]" />
                </div>
                <h1 className="text-base font-semibold text-white">¡Contraseña restablecida!</h1>
                <p className="text-sm text-[#848E9C]">Ya podés iniciar sesión con tu nueva contraseña.</p>
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="w-full h-10 rounded-lg bg-gradient-to-r from-[#7F00FF] to-[#9D00FF] text-sm font-semibold text-white"
                >
                  Iniciar sesión
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-base font-semibold text-white">Nueva contraseña</h1>
                <p className="mt-0.5 text-xs text-[#848E9C]">Elegí una contraseña segura.</p>

                {error && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#F6465D]/20 bg-[#F6465D]/10 px-4 py-3 text-sm text-[#F6465D]">
                    <IoWarningOutline className="size-5 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        autoFocus
                        className={inputClass + " pr-10"}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848E9C] hover:text-white"
                      >
                        {showPw ? <IoEyeOffOutline className="size-4" /> : <IoEyeOutline className="size-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="confirm" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                      Confirmar contraseña
                    </label>
                    <input
                      id="confirm"
                      type={showPw ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      className={inputClass}
                      placeholder="Repetí tu contraseña"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !token || !userId}
                    className="h-11 w-full rounded-lg bg-gradient-to-r from-[#7F00FF] to-[#9D00FF] text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Guardando..." : "Restablecer contraseña"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
