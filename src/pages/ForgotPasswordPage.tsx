import { useState } from "react";
import { useLocation, Link } from "wouter";
import { IoWarningOutline, IoCheckmarkCircleOutline, IoArrowBackOutline } from "react-icons/io5";
import api from "../services/api.service";

const inputClass =
  "w-full h-10 rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 text-sm text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20";

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.auth.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo");
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
            {sent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <IoCheckmarkCircleOutline className="size-14 text-[#0ECB81]" />
                </div>
                <h1 className="text-base font-semibold text-white">¡Correo enviado!</h1>
                <p className="text-sm text-[#848E9C]">
                  Si existe una cuenta con el correo <strong className="text-white">{email}</strong>, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                </p>
                <p className="text-xs text-[#848E9C]">
                  Revisá tu carpeta de spam si no lo encontrás.
                </p>
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="w-full h-10 rounded-lg bg-gradient-to-r from-[#7F00FF] to-[#9D00FF] text-sm font-semibold text-white"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="mb-4 flex items-center gap-1.5 text-xs text-[#848E9C] hover:text-white transition-colors"
                >
                  <IoArrowBackOutline className="size-3.5" /> Volver al inicio de sesión
                </button>

                <h1 className="text-base font-semibold text-white">Olvidé mi contraseña</h1>
                <p className="mt-0.5 text-xs text-[#848E9C]">
                  Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                {error && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#F6465D]/20 bg-[#F6465D]/10 px-4 py-3 text-sm text-[#F6465D]">
                    <IoWarningOutline className="size-5 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      className={inputClass}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-gradient-to-r from-[#7F00FF] to-[#9D00FF] text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? "Enviando..." : "Enviar enlace"}
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
