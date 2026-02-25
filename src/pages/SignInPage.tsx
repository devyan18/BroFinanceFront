import { useState, useEffect } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useLocation } from "wouter";
import { IoWarningOutline, IoRefreshOutline } from "react-icons/io5";
import GoogleLoginButton from "../components/GoogleLoginButton";

const inputClass =
  "w-full h-10 rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 text-sm text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20";

export default function SignInPage() {
  const [, setLocation] = useLocation();
  const { login, loginWithGoogle, user } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.needsPasswordSetup) {
        setLocation("/completar-registro");
      } else {
        setLocation("/inicio");
      }
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login({ identifier, password });
      setLocation("/inicio");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Correo/usuario o contraseña incorrectos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse: { code: string }) => {
    setError("");
    setIsLoading(true);
    try {
      await loginWithGoogle(tokenResponse.code);
      setLocation("/inicio");
    } catch {
      setError("No se pudo iniciar sesión con Google.");
    } finally {
      setIsLoading(false);
    }
  };

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

      <main className="flex min-h-screen items-center justify-center p-4" aria-label="Iniciar sesión">
        <div className="w-full max-w-[400px]">
          <div className="mb-6 text-center">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-white transition-opacity hover:opacity-80"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7F00FF] to-[#9D00FF]">
                <span className="text-xs font-bold">BF</span>
              </div>
              Bro Finances
            </a>
          </div>

          <div className="rounded-xl border border-[#2B3139]/50 bg-[#181A20]/80 backdrop-blur-sm p-6 shadow-2xl">
            <h1 className="text-base font-semibold text-white">Iniciar sesión</h1>
            <p className="mt-0.5 text-xs text-[#848E9C]">
              Entra a tu cuenta para continuar.
            </p>

            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-5 flex items-center gap-3 rounded-lg border border-[#F6465D]/20 bg-[#F6465D]/10 px-4 py-3 text-sm text-[#F6465D]"
              >
                <IoWarningOutline className="size-5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="identifier" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                  Correo o usuario
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  aria-invalid={!!error}
                  className={inputClass}
                  placeholder="tu@email.com o @usuario"
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  className={inputClass}
                  placeholder="••••••••"
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
                    Entrando…
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2B3139]" />
              </div>
              <p className="relative flex justify-center">
                <span className="bg-[#181A20] px-3 text-xs text-[#848E9C]">
                  o continúa con
                </span>
              </p>
            </div>

            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError("No se pudo iniciar sesión con Google.")}
              disabled={isLoading}
            />

            <p className="mt-4 text-center text-xs text-[#848E9C]">
              <a
                href="/forgot-password"
                className="font-semibold text-[#7F00FF] hover:text-[#9D00FF] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </p>

            <p className="mt-3 text-center text-sm text-[#848E9C]">
              ¿No tienes cuenta?{" "}
              <a
                href="/register"
                className="font-semibold text-[#7F00FF] hover:text-[#9D00FF] transition-colors"
              >
                Registrarse
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
