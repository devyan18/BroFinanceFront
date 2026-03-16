import { useAuth } from "../providers/AuthProvider";
import { useAppSettings } from "../providers/AppSettingsProvider";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import api from "../services/api.service";
import { getAvatarUrl } from "../utils/avatar";
import { AppLayout } from "../components/layout";
import SimpleHeader from "../components/layout/SimpleHeader";
import { Alert, Avatar, Button, Modal } from "../components/ui";
import { WALLET_PROVIDERS, getWalletProviderById } from "../constants/walletProviders";
import { useProfile } from "../hooks/useProfile";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { appSettings, setTheme, setLanguage } = useAppSettings();
  const [, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    profileForm: {
      username,
      setUsername,
      avatarUrl,
      setAvatarUrl,
      showCbu,
      setShowCbu,
      showEmail,
      setShowEmail,
      notifyNewChargesEmail,
      setNotifyNewChargesEmail,
      notifyNewChargesPush,
      setNotifyNewChargesPush,
    },
    walletsState: {
      wallets,
      favoriteWalletId,
      walletModal,
      setWalletModal,
      walletCbuInput,
      setWalletCbuInput,
      walletSaving,
      deleteWalletModal,
      setDeleteWalletModal,
      deleteWalletLoading,
    },
    passwordForm: {
      currentPassword,
      setCurrentPassword,
      newPassword,
      setNewPassword,
      confirmPassword,
      setConfirmPassword,
    },
    message,
    setMessage,
    saving,
    isEditing,
    setIsEditing,
    resetFormFromUser,
    handleUpdateProfile,
    handleWalletModalSave,
    handleChangePassword,
    handleDeleteWallet,
    setFavorite,
  } = useProfile({ user, updateUser });

  const inputClass =
    "w-full h-10 rounded-lg border border-[#2B3139] bg-[#0B0E11] px-4 text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20";

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
        updateUser(res.data.user);
        setAvatarUrl(res.data.user.avatarUrl ?? "");
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
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#848E9C]">Billeteras (CBU/CVU)</label>
                  <p className="mt-1 text-xs text-[#848E9C]">Para recibir transferencias de deudas. Podés agregar una por cada proveedor.</p>
                  {wallets.length === 0 ? (
                    <p className="mt-2 text-sm text-[#848E9C]">No configurado</p>
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {wallets.map((w) => (
                        <span
                          key={w._id}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${w.darkFont ? "text-gray-900" : "text-white"}`}
                          style={{ backgroundColor: w.color }}
                        >
                          {w.name}
                          {w._id === favoriteWalletId && (
                            <span className={`rounded px-1 text-xs ${w.darkFont ? "bg-black/20" : "bg-white/20"}`} title="Favorita para cobros">
                              ★
                            </span>
                          )}
                          <span className="font-mono opacity-90">{w.cbu.slice(-4)}</span>
                        </span>
                      ))}
                    </div>
                  )}
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
                  <label className="mb-2 block text-sm font-semibold text-[#EAECEF]">
                    Billeteras (CBU/CVU)
                  </label>
                  <p className="mb-3 text-xs text-[#848E9C]">Agregá una por cada proveedor. Solo podés tener una por tipo. Elegí una como favorita para recibir cobros.</p>
                  {wallets.length > 0 && !favoriteWalletId && (
                    <Alert variant="error" className="mb-3">
                      Elegí una billetera favorita para que otros puedan cobrarte.
                    </Alert>
                  )}
                  {wallets.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {wallets.map((w) => (
                        <div
                          key={w._id}
                          className="flex flex-wrap items-center gap-3 rounded-xl border border-[#2B3139]/60 p-3"
                          style={{ borderLeftWidth: 4, borderLeftColor: w.color }}
                        >
                          <span className={`text-sm font-medium ${w.darkFont ? "text-gray-900" : "text-white"}`} style={{ color: w.color }}>{w.name}</span>
                          {w._id === favoriteWalletId && (
                            <span className="rounded bg-[#7F00FF]/20 px-2 py-0.5 text-xs font-semibold text-[#7F00FF]">
                              Favorita
                            </span>
                          )}
                          <code className="flex-1 min-w-0 font-mono text-xs text-[#848E9C]">{w.cbu}</code>
                          {w._id !== favoriteWalletId && (
                            <Button
                              type="button"
                              variant="primary"
                              size="sm"
                            onClick={() => setFavorite(w._id)}
                            >
                              Usar como favorita
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setWalletModal({ type: "edit", wallet: w });
                              setWalletCbuInput(w.cbu);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setDeleteWalletModal(w)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mb-2 text-xs font-semibold text-[#848E9C]">Agregar billetera</p>
                  <div className="flex flex-wrap gap-2">
                    {WALLET_PROVIDERS.filter((p) => !wallets.some((w) => w.providerKey === p.id)).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setWalletModal({ type: "add", providerKey: p.id });
                          setWalletCbuInput("");
                        }}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 ${p.darkFont ? "text-gray-900" : "text-white"}`}
                        style={{ backgroundColor: p.color }}
                      >
                        + {p.name}
                      </button>
                    ))}
                    {WALLET_PROVIDERS.every((p) => wallets.some((w) => w.providerKey === p.id)) && (
                      <span className="text-xs text-[#848E9C] self-center">Ya tenés todas las billeteras agregadas</span>
                    )}
                  </div>
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
                    <span className="text-sm">Mostrar billeteras cuando visiten mi perfil</span>
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
                <div className="rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/30 p-4 space-y-3 mt-4">
                  <p className="text-xs font-semibold text-[#848E9C]">Notificaciones de cobros</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyNewChargesEmail}
                      onChange={(e) => setNotifyNewChargesEmail(e.target.checked)}
                      className="rounded border-[#2B3139] bg-[#0B0E11]"
                    />
                    <span className="text-sm">Recibir email cuando alguien me cobre</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyNewChargesPush}
                      onChange={(e) => setNotifyNewChargesPush(e.target.checked)}
                      className="rounded border-[#2B3139] bg-[#0B0E11]"
                    />
                    <span className="text-sm">Notificaciones push en la app cuando me cobren</span>
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
                      resetFormFromUser();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>

        <Modal
          isOpen={deleteWalletModal !== null}
          onClose={() => !deleteWalletLoading && setDeleteWalletModal(null)}
          title="Eliminar billetera"
          closeDisabled={deleteWalletLoading}
        >
          <div className="p-5 space-y-4">
            {deleteWalletModal && (
              <>
                <p className="text-sm text-[#848E9C]">
                  ¿Eliminar la billetera <strong style={{ color: deleteWalletModal.color }}>{deleteWalletModal.name}</strong>? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDeleteWalletModal(null)}
                    disabled={deleteWalletLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => deleteWalletModal && handleDeleteWallet(deleteWalletModal)}
                    disabled={deleteWalletLoading}
                    isLoading={deleteWalletLoading}
                  >
                    Eliminar
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>

        <Modal
          isOpen={walletModal !== null}
          onClose={() => {
            setWalletModal(null);
            setMessage(null);
          }}
          title={walletModal?.type === "add"
            ? `Agregar ${getWalletProviderById(walletModal.providerKey)?.name ?? walletModal.providerKey}`
            : "Editar CBU"}
          closeDisabled={walletSaving}
        >
          <div className="p-5 space-y-4">
            {walletModal?.type === "edit" && (
              <p className="text-sm text-[#848E9C]">
                {walletModal.wallet.name}
              </p>
            )}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#EAECEF]">CBU / CVU</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={walletCbuInput}
                onChange={(e) => setWalletCbuInput(e.target.value.replace(/\D/g, ""))}
                className="w-full h-10 rounded-lg border border-[#2B3139] bg-[#0B0E11] px-4 text-white placeholder-[#848E9C] focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
                placeholder="18 a 26 dígitos"
                maxLength={26}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setWalletModal(null)}
                disabled={walletSaving}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleWalletModalSave}
                disabled={walletSaving || walletCbuInput.replace(/\D/g, "").length < 18}
                isLoading={walletSaving}
              >
                Guardar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Configuración de la app (solo este dispositivo) */}
        <section className="mb-6 overflow-hidden rounded-xl border border-[#2B3139] bg-[#181A20]">
          <div className="border-b border-[#2B3139] px-6 py-4">
            <h2 className="text-lg font-bold">Configuración de la app</h2>
            <p className="mt-0.5 text-xs text-[#848E9C]">
              Solo afecta este dispositivo. No se sincroniza con tu cuenta.
            </p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#848E9C] mb-2">Tema</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appSettings.theme === "dark"
                      ? "bg-[#7F00FF] text-white"
                      : "bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] hover:border-[#7F00FF]/50"
                  }`}
                >
                  Oscuro
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    appSettings.theme === "light"
                      ? "bg-[#7F00FF] text-white"
                      : "bg-[#0B0E11] border border-[#2B3139] text-[#848E9C] hover:border-[#7F00FF]/50"
                  }`}
                >
                  Claro
                </button>
              </div>
              <p className="mt-1 text-xs text-[#848E9C]">El tema claro se aplicará en una próxima actualización.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#848E9C] mb-2">Idioma</label>
              <select
                value={appSettings.language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full max-w-xs h-10 rounded-lg border border-[#2B3139] bg-[#0B0E11] px-4 text-sm text-white"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
              <p className="mt-1 text-xs text-[#848E9C]">Los textos en el idioma elegido se mostrarán en una próxima actualización.</p>
            </div>
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
