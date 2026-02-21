import { useAuth } from "../providers/AuthProvider";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { IoPersonAddOutline, IoCheckmarkOutline } from "react-icons/io5";
import api from "../services/api.service";
import type { FriendStatus } from "../services/api.service";
import type { Compra } from "../types/compras";
import { formatMoney, formatDate } from "../utils/formatters";
import { getAvatarUrl } from "../utils/avatar";
import { AppLayout } from "../components/layout";
import Navbar from "../components/layout/Navbar";
import { Alert, Avatar, Badge, Button, Card, Modal, PageSection, Spinner } from "../components/ui";

export default function UserProfilePage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/user/:userId");
  const userId = params?.userId;

  const [profileUser, setProfileUser] = useState<{
    _id: string;
    username: string;
    avatarUrl?: string;
    cbu?: string;
    email?: string;
  } | null>(null);
  const [friendStatus, setFriendStatus] = useState<{ status: FriendStatus; requestId?: string } | null>(null);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payResult, setPayResult] = useState<{
    cbu: string;
    monto: number;
    descripcion: string;
    acreedorUsername: string;
  } | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const [profileRes, comprasRes, statusRes] = await Promise.all([
        api.auth.getUserPublic(userId),
        api.compras.getAll(1, 200, { usuario: userId }),
        api.friends.getStatus(userId),
      ]);
      if (profileRes.success && profileRes.data?.user) {
        const u = profileRes.data.user;
        if (u._id && u.username) {
          setProfileUser({
            _id: u._id,
            username: u.username,
            avatarUrl: u.avatarUrl,
            cbu: u.cbu,
            email: u.email,
          });
        } else {
          setError("Usuario no encontrado");
        }
      } else {
        setError(profileRes.error || "Usuario no encontrado");
      }
      if (comprasRes.success && comprasRes.data) {
        setCompras(comprasRes.data);
      }
      if (statusRes.success && statusRes.data) {
        setFriendStatus(statusRes.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!userId) setLocation("/inicio");
  }, [userId, setLocation]);

  if (!userId) return null;

  const isAcreedor = (c: Compra) => {
    const aid = typeof c.acreedorId === "object" ? c.acreedorId._id : c.acreedorId;
    return user?._id === aid;
  };
  const getAcreedorId = (c: Compra) =>
    typeof c.acreedorId === "object" ? c.acreedorId._id : c.acreedorId;
  const isAceptado = (c: Compra) => c.estado === "aceptado" || c.estado === undefined;

  const handlePay = async (acreedorId: string, compraIds: string[]) => {
    setPayModalOpen(true);
    setPayLoading(true);
    setPayError(null);
    setPayResult(null);
    setCopied(false);
    try {
      const res = await api.payments.getTransferInfo({ acreedorId, compraIds });
      if (res.success && res.data) {
        setPayResult(res.data);
      } else {
        setPayError(res.error || "Error al obtener datos");
      }
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Error al obtener datos");
    } finally {
      setPayLoading(false);
    }
  };

  const copyCbu = () => {
    if (payResult?.cbu) {
      navigator.clipboard.writeText(payResult.cbu);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closePayModal = () => {
    setPayModalOpen(false);
    setPayResult(null);
    setPayError(null);
    setCopied(false);
  };

  return (
    <AppLayout>
      <Navbar
        user={user}
        balance={user?.balance ?? 0}
        onLogout={async () => {
          await logout();
          setLocation("/");
        }}
        navItems={[
          { href: "/inicio", label: "Inicio" },
          { href: "/amigos", label: "Amigos" },
          { href: "/charts", label: "Gráficas" },
        ]}
        currentPath="/user"
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => setLocation("/inicio")}
          className="mb-4 text-xs font-medium text-[#848E9C] hover:text-white transition-colors"
        >
          ← Volver al inicio
        </button>

        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {loading ? (
          <Card hover={false} className="py-16 text-center">
            <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-[#2B3139] border-t-[#7F00FF]" />
            <p className="text-xs text-[#848E9C]">Cargando...</p>
          </Card>
        ) : profileUser ? (
          <>
            <section className="mb-6 overflow-hidden rounded-xl border border-[#2B3139] bg-[#181A20]">
              <div className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={profileUser.username}
                      src={getAvatarUrl(profileUser.avatarUrl)}
                      size="lg"
                      variant="default"
                    />
                    <div>
                      <h1 className="text-xl font-bold text-white">{profileUser.username}</h1>
                      {profileUser.email && (
                        <p className="text-sm text-[#848E9C]">{profileUser.email}</p>
                      )}
                    </div>
                  </div>
                  {friendStatus && friendStatus.status !== "self" && (
                    <div className="shrink-0">
                      {friendStatus.status === "none" && (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={async () => {
                            setFriendActionLoading(true);
                            try {
                              await api.friends.sendRequest(profileUser._id);
                              setFriendStatus({ status: "pending_sent" });
                            } catch (e) {
                              setError(e instanceof Error ? e.message : "Error al enviar solicitud");
                            } finally {
                              setFriendActionLoading(false);
                            }
                          }}
                          isLoading={friendActionLoading}
                          leftIcon={<IoPersonAddOutline className="size-5" />}
                        >
                          Agregar amigo
                        </Button>
                      )}
                      {friendStatus.status === "pending_sent" && (
                        <span className="rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/40 px-4 py-2 text-sm text-[#848E9C]">
                          Solicitud enviada
                        </span>
                      )}
                      {friendStatus.status === "pending_received" && friendStatus.requestId && (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={async () => {
                            setFriendActionLoading(true);
                            try {
                              await api.friends.acceptRequest(friendStatus.requestId!);
                              setFriendStatus({ status: "friend" });
                            } catch (e) {
                              setError(e instanceof Error ? e.message : "Error al aceptar");
                            } finally {
                              setFriendActionLoading(false);
                            }
                          }}
                          isLoading={friendActionLoading}
                          leftIcon={<IoCheckmarkOutline className="size-5" />}
                        >
                          Aceptar solicitud
                        </Button>
                      )}
                      {friendStatus.status === "friend" && (
                        <span className="rounded-lg border border-[#0ECB81]/40 bg-[#0ECB81]/10 px-4 py-2 text-sm font-medium text-[#0ECB81]">
                          Ya son amigos
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {profileUser.cbu && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#848E9C]">
                      CBU / CVU
                    </label>
                    <p className="mt-1 font-mono text-sm text-white break-all">{profileUser.cbu}</p>
                  </div>
                )}
              </div>
            </section>

            <PageSection title="Transacciones" description={`${compras.length} movimiento(s) con ${profileUser.username}`}>
              {compras.length === 0 ? (
                <Card hover={false} className="py-12 text-center">
                  <p className="text-sm text-[#848E9C]">No hay transacciones con esta persona</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {compras.map((c) => {
                    const isIn = isAcreedor(c);
                    const tipoDesc = typeof c.tipo === "object" ? c.tipo.descripcion : "";
                    const acreedor = typeof c.acreedorId === "object" ? c.acreedorId : null;
                    const deudor = typeof c.deudorId === "object" ? c.deudorId : null;
                    const other = isIn ? deudor : acreedor;

                    return (
                      <Card key={c._id} hover={false} padding="sm" className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{c.descripcion}</p>
                          <p className="text-xs text-[#848E9C]">
                            {acreedor?.username || "?"}
                            {isIn ? " te cobró" : ` → ${other?.username || "?"}`} · {formatDate(c.createdAt)}
                          </p>
                          {tipoDesc && (
                            <Badge variant="default" className="mt-1">{tipoDesc}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`font-mono text-sm font-semibold tabular-nums ${
                              isIn ? "text-[#0ECB81]" : "text-[#F6465D]"
                            }`}
                          >
                            {formatMoney(isIn ? c.montoAcreedor : c.montoDeudor)}
                          </span>
                          {!isIn && isAceptado(c) && (
                            <Button
                              variant="pay"
                              size="sm"
                              onClick={() => handlePay(getAcreedorId(c), [c._id])}
                            >
                              Pagar
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </PageSection>
          </>
        ) : null}
      </main>

      <Modal isOpen={payModalOpen} onClose={closePayModal} title="Transferir">
        <div className="p-5">
          {payLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spinner size="lg" className="mb-3" />
              <p className="text-sm text-[#848E9C]">Cargando...</p>
            </div>
          ) : payError ? (
            <Alert variant="error">{payError}</Alert>
          ) : payResult ? (
            <div className="space-y-4">
              <p className="text-sm text-[#848E9C]">{payResult.descripcion}</p>
              <p className="font-mono text-xl font-bold text-white">
                {formatMoney(payResult.monto)}
              </p>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#848E9C] mb-1">
                  CBU / CVU de {payResult.acreedorUsername}
                </label>
                <div className="flex gap-2">
                  <code className="flex-1 rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 font-mono text-sm text-white break-all">
                    {payResult.cbu}
                  </code>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={copyCbu}
                    className="shrink-0"
                  >
                    {copied ? "¡Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-[#848E9C]">
                Transfiere este monto al CBU indicado
              </p>
            </div>
          ) : null}
        </div>
      </Modal>
    </AppLayout>
  );
}
