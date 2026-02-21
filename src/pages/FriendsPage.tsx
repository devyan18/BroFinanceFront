import { useAuth } from "../providers/AuthProvider";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback, useRef } from "react";
import { IoPersonAddOutline, IoSearchOutline, IoCheckmarkOutline, IoCloseOutline } from "react-icons/io5";
import api from "../services/api.service";
import type { Friend, FriendRequest, FriendsRequestsData, SearchUser } from "../services/api.service";
import { getAvatarUrl } from "../utils/avatar";
import { AppLayout } from "../components/layout";
import Navbar from "../components/layout/Navbar";
import {
  Alert,
  Avatar,
  Button,
  Card,
  EmptyState,
  PageSection,
  Spinner,
} from "../components/ui";

export default function FriendsPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendsRequestsData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [friendsRes, requestsRes] = await Promise.all([
        api.friends.getFriends(),
        api.friends.getRequests(),
      ]);
      if (friendsRes.success && friendsRes.data) setFriends(friendsRes.data);
      if (requestsRes.success && requestsRes.data) setRequests(requestsRes.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError(null);
      return;
    }
    setSearchError(null);
    setHasSearched(false);
    setSearching(true);
    try {
      const res = await api.friends.searchUsers(q);
      if (res.success && res.data) {
        setSearchResults(res.data);
      } else {
        setSearchResults([]);
        setSearchError(res.error || "Error al buscar");
      }
    } catch (e) {
      setSearchResults([]);
      setSearchError(e instanceof Error ? e.message : "Error al conectar con el servidor");
    } finally {
      setSearching(false);
      setHasSearched(true);
    }
  }, []);

  // Debounced search on every keystroke
  useEffect(() => {
    const q = searchQuery.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      setSearchError(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(() => runSearch(q), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, runSearch]);

  const handleSendRequest = async (userId: string) => {
    try {
      setActionLoading(userId);
      await api.friends.sendRequest(userId);
      setSearchResults((prev) => prev.filter((u) => u.id !== userId));
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar solicitud");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await api.friends.acceptRequest(requestId);
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al aceptar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await api.friends.rejectRequest(requestId);
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al rechazar");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    if (!confirm("¿Eliminar amigo? Seguirás pudiendo ver transacciones pasadas.")) return;
    try {
      setActionLoading(userId);
      await api.friends.removeFriend(userId);
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setActionLoading(null);
    }
  };

  const received = requests?.received ?? [];
  const sent = requests?.sent ?? [];

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
        currentPath="/amigos"
      />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-xl font-bold text-white">Amigos</h1>
        <p className="mb-6 text-sm text-[#848E9C]">
          Solo puedes registrar gastos compartidos con amigos. Agrega amigos para dividir gastos como roomies.
        </p>

        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {/* Agregar amigo - destacado */}
        <Card
          hover={false}
          className="mb-6 border-[#7F00FF]/30 bg-gradient-to-br from-[#7F00FF]/10 to-transparent"
        >
          <div className="p-5">
            <h2 className="mb-2 flex items-center gap-2 text-base font-semibold text-white">
              <IoPersonAddOutline className="size-5 text-[#7F00FF]" />
              Agregar nuevo amigo
            </h2>
            <p className="mb-4 text-xs text-[#848E9C]">
              Busca por <span className="text-white">@usuario</span> o correo. Los resultados aparecen automáticamente.
            </p>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                {searching
                  ? <Spinner size="sm" />
                  : <IoSearchOutline className="size-4 text-[#848E9C]" />
                }
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="@usuario o correo"
                autoComplete="off"
                className="w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 py-2.5 pl-9 pr-4 text-sm text-white placeholder-[#848E9C] focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-[#848E9C] hover:text-white"
                >
                  <IoCloseOutline className="size-4" />
                </button>
              )}
            </div>
            {searchError && (
              <div className="mt-3 rounded-lg border border-[#F6465D]/30 bg-[#F6465D]/10 px-4 py-3 text-sm text-[#F6465D]">
                {searchError}
              </div>
            )}

            {hasSearched && !searchError && searchResults.length === 0 && (
              <div className="mt-3 rounded-lg border border-[#2B3139]/60 bg-[#2B3139]/20 px-4 py-3 text-center text-sm text-[#848E9C]">
                Sin resultados para "<span className="text-white">{searchQuery}</span>". Prueba con otro correo o usuario.
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((u) => (
                  <Card key={u.id} hover={false} padding="sm" className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.username} src={getAvatarUrl(u.avatarUrl)} size="sm" variant="default" />
                      <div>
                        <p className="font-medium text-sm text-white">{u.username}</p>
                        {u.email && <p className="text-xs text-[#848E9C]">{u.email}</p>}
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSendRequest(u.id)}
                      isLoading={actionLoading === u.id}
                      leftIcon={<IoPersonAddOutline className="size-4" />}
                    >
                      Agregar
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Solicitudes pendientes */}
        {(received.length > 0 || sent.length > 0) && (
          <PageSection
            title="Solicitudes pendientes"
            description={`${received.length} recibida(s), ${sent.length} enviada(s)`}
          >
            {loading ? (
              <Card hover={false} className="py-12 text-center">
                <Spinner size="lg" className="mx-auto" />
              </Card>
            ) : (
              <div className="space-y-3">
                {received.map((r: FriendRequest) => (
                  <Card key={r.id} hover={false} padding="sm" className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <a href={r.user?._id ? `/user/${r.user._id}` : "#"} className="flex items-center gap-3 min-w-0">
                        <Avatar
                          name={r.user?.username ?? "?"}
                          src={getAvatarUrl(r.user?.avatarUrl)}
                          size="sm"
                          variant="default"
                        />
                        <p className="font-medium text-sm text-white truncate">{r.user?.username ?? "Usuario"}</p>
                      </a>
                      <span className="text-xs text-[#848E9C] shrink-0">te envió solicitud</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(r.id)}
                        isLoading={actionLoading === r.id}
                        leftIcon={<IoCheckmarkOutline className="size-4" />}
                      >
                        Aceptar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReject(r.id)}
                        disabled={!!actionLoading}
                      >
                        <IoCloseOutline className="size-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                {sent.map((r: FriendRequest) => (
                  <Card key={r.id} hover={false} padding="sm" className="flex items-center gap-3">
                    <Avatar
                      name={r.user?.username ?? "?"}
                      src={getAvatarUrl(r.user?.avatarUrl)}
                      size="sm"
                      variant="default"
                    />
                    <p className="font-medium text-sm text-white">{r.user?.username ?? "Usuario"}</p>
                    <span className="text-xs text-[#848E9C]">solicitud enviada</span>
                  </Card>
                ))}
              </div>
            )}
          </PageSection>
        )}

        {/* Lista de amigos */}
        <PageSection title="Mis amigos" description={`${friends.length} amigo(s)`}>
          {loading ? (
            <Card hover={false} className="py-12 text-center">
              <Spinner size="lg" className="mx-auto" />
            </Card>
          ) : friends.length === 0 ? (
            <EmptyState
              icon={<IoPersonAddOutline className="size-12 text-[#848E9C]" />}
              title="Sin amigos"
              description="Busca usuarios y envíales solicitud para compartir gastos."
            />
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <Card key={f.id} hover={false} padding="sm" className="flex items-center justify-between gap-4">
                  <a
                    href={`/user/${f.id}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <Avatar name={f.username} src={getAvatarUrl(f.avatarUrl)} size="sm" variant="default" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-white truncate">{f.username}</p>
                      {f.email && <p className="text-xs text-[#848E9C] truncate">{f.email}</p>}
                    </div>
                  </a>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemoveFriend(f.id)}
                    isLoading={actionLoading === f.id}
                  >
                    Quitar
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </PageSection>
      </main>
    </AppLayout>
  );
}
