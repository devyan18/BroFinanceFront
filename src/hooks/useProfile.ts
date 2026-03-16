import { useState, useEffect } from "react";
import api from "../services/api.service";
import type { User, UserWallet } from "../types/auth";

interface UseProfileOptions {
  user: User | null | undefined;
  updateUser: (user: User | null) => void;
}

export function useProfile({ user, updateUser }: UseProfileOptions) {
  const [username, setUsername] = useState<string>(user?.username ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl ?? "");
  const [showCbu, setShowCbu] = useState(user?.showCbu !== false);
  const [showEmail, setShowEmail] = useState(user?.showEmail === true);
  const [wallets, setWallets] = useState<UserWallet[]>(() => user?.wallets ?? []);
  const [favoriteWalletId, setFavoriteWalletId] = useState<string | null>(
    () => user?.favoriteWalletId ?? null,
  );
  const [walletModal, setWalletModal] = useState<
    | { type: "add"; providerKey: string }
    | { type: "edit"; wallet: UserWallet }
    | null
  >(null);
  const [walletCbuInput, setWalletCbuInput] = useState("");
  const [walletSaving, setWalletSaving] = useState(false);
  const [deleteWalletModal, setDeleteWalletModal] = useState<UserWallet | null>(
    null,
  );
  const [deleteWalletLoading, setDeleteWalletLoading] = useState(false);
  const [notifyNewChargesEmail, setNotifyNewChargesEmail] = useState(
    user?.notifyNewChargesEmail !== false,
  );
  const [notifyNewChargesPush, setNotifyNewChargesPush] = useState(
    user?.notifyNewChargesPush !== false,
  );
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const u = user;
    setUsername(u?.username ?? "");
    setAvatarUrl(u?.avatarUrl ?? "");
    setShowCbu(u?.showCbu !== false);
    setShowEmail(u?.showEmail === true);
    setWallets(u?.wallets ?? []);
    setFavoriteWalletId(u?.favoriteWalletId ?? null);
    setNotifyNewChargesEmail(u?.notifyNewChargesEmail !== false);
    setNotifyNewChargesPush(u?.notifyNewChargesPush !== false);
  }, [user]);

  const resetFormFromUser = () => {
    const u = user;
    setUsername(u?.username ?? "");
    setAvatarUrl(u?.avatarUrl ?? "");
    setShowCbu(u?.showCbu !== false);
    setShowEmail(u?.showEmail === true);
    setWallets(u?.wallets ?? []);
    setFavoriteWalletId(u?.favoriteWalletId ?? null);
    setNotifyNewChargesEmail(u?.notifyNewChargesEmail !== false);
    setNotifyNewChargesPush(u?.notifyNewChargesPush !== false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      setSaving(true);
      const av = (typeof avatarUrl === "string" ? avatarUrl : "").trim() || undefined;
      const res = await api.auth.updateProfile({
        username,
        avatarUrl: av,
        showCbu,
        showEmail,
        notifyNewChargesEmail,
        notifyNewChargesPush,
      });
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        setMessage({
          type: "success",
          text: "Perfil actualizado correctamente",
        });
        setIsEditing(false);
      } else {
        setMessage({
          type: "error",
          text: res.error || "Error al actualizar el perfil",
        });
      }
    } catch (e) {
      const err = e as Error & {
        errors?: Array<{ path: string; message: string }>;
      };
      const text =
        err.errors?.length && err.errors[0]?.message
          ? err.errors.map((x) => x.message).join(". ")
          : err.message || "Error al actualizar el perfil";
      setMessage({ type: "error", text });
    } finally {
      setSaving(false);
    }
  };

  const handleWalletModalSave = async () => {
    const cbu = walletCbuInput.replace(/\D/g, "").trim();
    if (cbu.length < 18 || cbu.length > 26) {
      setMessage({
        type: "error",
        text: "CBU/CVU debe tener entre 18 y 26 dígitos",
      });
      return;
    }
    setMessage(null);
    setWalletSaving(true);
    try {
      if (walletModal?.type === "add") {
        const res = await api.wallets.add(walletModal.providerKey, cbu);
        if (res.success) {
          const me = await api.auth.getMe();
          if (me.success && me.data?.user) {
            updateUser(me.data.user);
            setWallets(me.data.user.wallets ?? []);
            setFavoriteWalletId(me.data.user.favoriteWalletId ?? null);
          }
          setWalletModal(null);
        } else {
          setMessage({
            type: "error",
            text: res.error ?? "Error al agregar billetera",
          });
        }
      } else if (walletModal?.type === "edit") {
        const res = await api.wallets.update(walletModal.wallet._id, cbu);
        if (res.success) {
          const me = await api.auth.getMe();
          if (me.success && me.data?.user) {
            updateUser(me.data.user);
            setWallets(me.data.user.wallets ?? []);
            setFavoriteWalletId(me.data.user.favoriteWalletId ?? null);
          }
          setWalletModal(null);
        } else {
          setMessage({
            type: "error",
            text: res.error ?? "Error al actualizar billetera",
          });
        }
      }
    } catch (e) {
      setMessage({ type: "error", text: (e as Error).message ?? "Error" });
    } finally {
      setWalletSaving(false);
    }
  };

  const handleDeleteWallet = async (wallet: UserWallet) => {
    setDeleteWalletLoading(true);
    try {
      const res = await api.wallets.remove(wallet._id);
      if (res.success) {
        const me = await api.auth.getMe();
        if (me.success && me.data?.user) {
          updateUser(me.data.user);
          setWallets(me.data.user.wallets ?? []);
          setFavoriteWalletId(me.data.user.favoriteWalletId ?? null);
        }
        setDeleteWalletModal(null);
      }
    } finally {
      setDeleteWalletLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }
    try {
      setSaving(true);
      await api.auth.changePassword(currentPassword, newPassword);
      setMessage({
        type: "success",
        text: "Contraseña actualizada correctamente",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error ? err.message : "Error al cambiar la contraseña",
      });
    } finally {
      setSaving(false);
    }
  };

  const setFavorite = async (walletId: string) => {
    const res = await api.auth.updateProfile({ favoriteWalletId: walletId });
    if (res.success && res.data?.user) {
      updateUser(res.data.user);
      setFavoriteWalletId(res.data.user.favoriteWalletId ?? null);
    }
  };

  return {
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
      setWallets,
      favoriteWalletId,
      setFavoriteWalletId,
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
    handleDeleteWallet,
    handleChangePassword,
    setFavorite,
  };
}
