import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useLocation } from "wouter";
import { IoWarningOutline, IoRefreshOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

const inputClass =
  "w-full h-10 rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 text-sm text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20";

export default function CompleteProfilePage() {
  const [, setLocation] = useLocation();
  const { user, setPassword } = useAuth();

  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if user doesn't need setup or isn't logged in
  useEffect(() => {
    if (user === null) setLocation("/");
    if (user && !user.needsPasswordSetup) setLocation("/inicio");
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres.");
      return;
    }
    if (password.length < 5) {
      setError("La contraseña debe tener al menos 5 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsLoading(true);
    try {
      await setPassword(username, password, confirmPassword);
      setLocation("/inicio");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al configurar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0B0E11] text-white">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, #181A20 1px, transparent 1px),
            linear-gradient(to bottom, #181A20 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#7F00FF] rounded-full mix-blend-normal filter blur-[128px] opacity-20 -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#7F00FF] rounded-full mix-blend-normal filter blur-[128px] opacity-10 -z-10" />

      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7F00FF] to-[#9D00FF]">
                <span className="text-xs font-bold">BF</span>
              </div>
              Bro Finances
            </div>
          </div>

          <div className="rounded-xl border border-[#2B3139]/50 bg-[#181A20]/80 backdrop-blur-sm p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-5">
              <h1 className="text-base font-semibold text-white">Completa tu perfil</h1>
              <p className="mt-0.5 text-xs text-[#848E9C]">
                Hola, <span className="text-white font-medium">{user.email}</span>.
                Para poder iniciar sesión en la app mobile, crea una contraseña y elige tu nombre de usuario.
              </p>
            </div>

            {/* Info box */}
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-[#7F00FF]/20 bg-[#7F00FF]/10 px-4 py-3 text-xs text-[#848E9C]">
              <IoCheckmarkCircleOutline className="mt-0.5 size-4 shrink-0 text-[#7F00FF]" />
              <span>
                Podrás seguir usando Google para entrar a la web, y además iniciar sesión en la app mobile con tu correo o usuario y esta contraseña.
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-4 flex items-center gap-3 rounded-lg border border-[#F6465D]/20 bg-[#F6465D]/10 px-4 py-3 text-sm text-[#F6465D]"
              >
                <IoWarningOutline className="size-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                  Nombre de usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className={inputClass}
                  placeholder="@usuario"
                  minLength={3}
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="Mínimo 5 caracteres"
                  minLength={5}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="Repite la contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`h-11 w-full rounded-lg text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:pointer-events-none ${
                  isLoading
                    ? "bg-[#2B3139] text-[#848E9C]"
                    : "bg-gradient-to-r from-[#7F00FF] to-[#9D00FF] text-white shadow-md shadow-[#7F00FF]/15 hover:shadow-lg hover:shadow-[#7F00FF]/25"
                }`}
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <IoRefreshOutline className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    Guardando…
                  </span>
                ) : (
                  "Guardar y continuar"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
