import { useAuth } from "../providers/AuthProvider";
import { useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import api from "../services/api.service";
import { getAvatarUrl } from "../utils/avatar";
import { AppLayout } from "../components/layout";
import SimpleHeader from "../components/layout/SimpleHeader";
import { Alert, Avatar, Button } from "../components/ui";

export default function ProfilePage() {
  const { user, logout, verifyAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  const [username, setUsername] = useState(user?.username || "");
  const [cbu, setCbu] = useState(user?.cbu || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [showCbu, setShowCbu] = useState(user?.showCbu !== false);
  const [showEmail, setShowEmail] = useState(user?.showEmail === true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsername(user?.username || "");
    setCbu(user?.cbu || "");
    setAvatarUrl(user?.avatarUrl || "");
    setShowCbu(user?.showCbu !== false);
    setShowEmail(user?.showEmail === true);
  }, [user]);

  const inputClass =
    "w-full h-10 rounded-lg border border-[#2B3139] bg-[#0B0E11] px-4 text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20";

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      setSaving(true);
      const av = avatarUrl.trim() || undefined;
      const res = await api.auth.updateProfile({
        username,
        cbu: cbu.trim() || undefined,
        avatarUrl: av,
        showCbu,
        showEmail,
      });
      if (res.success && res.data?.user) {
        await verifyAuth();
        setMessage({ type: "success", text: "Perfil actualizado correctamente" });
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: res.error || "Error al actualizar el perfil" });
      }
    } catch (e) {
      const err = e as Error & { errors?: Array<{ path: string; message: string }> };
      const text =
        err.errors?.length && err.errors[0]?.message
          ? err.errors.map((x) => x.message).join(". ")
          : err.message || "Error al actualizar el perfil";
      setMessage({ type: "error", text });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }
    if (newPassword.length < 5) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 5 caracteres" });
      return;
    }
    try {
      setMessage({ type: "success", text: "Contraseña actualizada correctamente" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setMessage({ type: "error", text: "Error al cambiar la contraseña" });
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Solo se permiten imágenes (JPEG, PNG, WebP, GIF)" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "error", text: "La imagen no puede superar 2MB" });
      return;
    }
    setMessage(null);
    try {
      setUploading(true);
      const res = await api.auth.uploadAvatar(file);
      if (res.success && res.data?.user) {
        await verifyAuth();
        setAvatarUrl(res.data.avatarUrl);
        setMessage({ type: "success", text: "Foto actualizada correctamente" });
      } else {
        setMessage({ type: "error", text: res.error || "Error al subir la imagen" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Error al subir la imagen" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <AppLayout>
      <SimpleHeader onLogout={handleLogout} />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-5">
          <h1 className="text-lg font-semibold tracking-tight">Mi perfil</h1>
          <p className="mt-0.5 text-xs text-[#848E9C]">
            Administra tu información y configura qué verán otros usuarios al ver tu perfil.
          </p>
        </div>

        {message && (
          <div className="mb-6">
            <Alert variant={message.type === "success" ? "success" : "error"}>{message.text}</Alert>
          </div>
        )}

        <section className="mb-6 overflow-hidden rounded-xl border border-[#2B3139] bg-[#181A20]">
          <div className="border-b border-[#2B3139] px-6 py-4">
            <div className="flex items-center gap-4">
              <Avatar name={user?.username ?? "U"} src={getAvatarUrl(user?.avatarUrl)} size="lg" variant="default" />
              <div>
                <h2 className="text-lg font-bold text-white">{user?.username}</h2>
                <p className="text-sm text-[#848E9C]">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#848E9C]">Nombre de usuario</label>
                  <p className="mt-1 text-sm text-white">{user?.username}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#848E9C]">Correo electrónico</label>
                  <p className="mt-1 text-sm text-white">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#848E9C]">CBU / CVU</label>
                  <p className="mt-1 text-sm text-white font-mono">{user?.cbu ? user.cbu : "No configurado"}</p>
                  <p className="mt-1 text-xs text-[#848E9C]">Para recibir transferencias de deudas</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#848E9C]">Proveedor</label>
                  <p className="mt-1 text-sm text-white">{user?.provider?.join(", ") || "Local"}</p>
                </div>
                <Button variant="primary" size="lg" onClick={() => setIsEditing(true)}>
                  Editar perfil
                </Button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                    minLength={3}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                    Foto de perfil
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={uploading}
                      isLoading={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? "Subiendo..." : "Subir imagen"}
                    </Button>
                    <span className="text-xs text-[#848E9C] self-center">o pega una URL</span>
                  </div>
                  <input
                    id="avatarUrl"
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className={`${inputClass} mt-2`}
                    placeholder="https://ejemplo.com/mi-foto.jpg"
                  />
                  <p className="mt-1 text-xs text-[#848E9C]">
                    Sube una imagen o pega una URL. Deja vacío para conservar la actual. Máx 2MB (JPEG, PNG, WebP, GIF).
                  </p>
                </div>
                <div>
                  <label htmlFor="cbu" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                    CBU / CVU
                  </label>
                  <input
                    id="cbu"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={cbu}
                    onChange={(e) => setCbu(e.target.value.replace(/\D/g, ""))}
                    className={inputClass}
                    placeholder="22 dígitos (Argentina) o 20 (Chile)"
                    maxLength={26}
                  />
                  <p className="mt-1 text-xs text-[#848E9C]">Donde recibirás las transferencias de deudas</p>
                </div>
                <div className="rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/30 p-4 space-y-3">
                  <p className="text-xs font-semibold text-[#848E9C]">Visibilidad para otros usuarios</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCbu}
                      onChange={(e) => setShowCbu(e.target.checked)}
                      className="rounded border-[#2B3139] bg-[#0B0E11]"
                    />
                    <span className="text-sm">Mostrar CBU cuando visiten mi perfil</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showEmail}
                      onChange={(e) => setShowEmail(e.target.checked)}
                      className="rounded border-[#2B3139] bg-[#0B0E11]"
                    />
                    <span className="text-sm">Mostrar email cuando visiten mi perfil</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" size="lg" disabled={saving} isLoading={saving}>
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(user?.username || "");
                      setCbu(user?.cbu || "");
                      setAvatarUrl(user?.avatarUrl || "");
                      setShowCbu(user?.showCbu !== false);
                      setShowEmail(user?.showEmail === true);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Cambiar contraseña */}
        {user?.provider?.includes("local") && (
          <section className="mb-6 overflow-hidden rounded-xl border border-[#2B3139] bg-[#181A20]">
            <div className="border-b border-[#2B3139] px-6 py-4">
              <h2 className="text-lg font-bold">Cambiar contraseña</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4 p-6">
              <div>
                <label htmlFor="currentPassword" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                  Contraseña actual
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                  Nueva contraseña
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={5}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                  Confirmar nueva contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={5}
                  className={inputClass}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-[#7F00FF] to-[#9D00FF] px-4 py-2.5 font-semibold text-white"
              >
                Actualizar contraseña
              </button>
            </form>
          </section>
        )}

        {/* Zona peligrosa */}
        <section className="overflow-hidden rounded-xl border border-[#F6465D]/30 bg-[#F6465D]/5">
          <div className="border-b border-[#F6465D]/30 px-6 py-4">
            <h2 className="text-lg font-bold text-[#F6465D]">Zona peligrosa</h2>
          </div>
          <div className="p-6">
            <p className="mb-4 text-sm text-[#848E9C]">
              Cierra sesión para salir de tu cuenta en este dispositivo.
            </p>
            <Button variant="outline-danger" size="lg" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
