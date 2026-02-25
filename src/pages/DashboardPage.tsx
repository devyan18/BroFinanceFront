import { useAuth } from "../providers/AuthProvider";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback, useMemo } from "react";
import { IoWalletOutline, IoArrowUpOutline, IoArrowDownOutline, IoAdd, IoWarningOutline, IoPersonOutline, IoCheckmark, IoPeopleOutline, IoCheckmarkDoneOutline, IoTimeOutline, IoPencilOutline } from "react-icons/io5";
import api from "../services/api.service";
import type { Compra, TipoCompra, Roommate } from "../types/compras";
import { getSubfilters, isOtros } from "../constants/subfilters";
import { formatMoney, formatDate } from "../utils/formatters";
import { getAvatarUrl } from "../utils/avatar";
import { AppLayout } from "../components/layout";
import Navbar from "../components/layout/Navbar";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  PageSection,
  Spinner,
  StatCard,
} from "../components/ui";

export default function DashboardPage() {
  const { user, logout, verifyAuth } = useAuth();
  const [, setLocation] = useLocation();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payCompraIds, setPayCompraIds] = useState<string[]>([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editCompra, setEditCompra] = useState<Compra | null>(null);
  const [editForm, setEditForm] = useState({ descripcion: "", montoTotal: "", montoDeudor: "", tipo: "" });
  const [editing, setEditing] = useState(false);
  const [payResult, setPayResult] = useState<{
    cbu: string;
    monto: number;
    descripcion: string;
    acreedorUsername: string;
  } | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [notifyPaymentLoading, setNotifyPaymentLoading] = useState(false);
  const [tipos, setTipos] = useState<TipoCompra[]>([]);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // deudores: map of { [userId]: montoDeudor string }, empty = personal expense
  const [form, setForm] = useState({
    descripcion: "",
    montoTotal: "",
    tipo: "",
    isSolo: true,
    deudores: {} as Record<string, string>,
  });

  const [filterTipo, setFilterTipo] = useState("");
  const [filterSubcategoria, setFilterSubcategoria] = useState("");
  const [filterUsuario, setFilterUsuario] = useState("");
  const [sectorTab, setSectorTab] = useState<"todos" | "roomies" | "personal">("todos");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "montoTotal" | "montoDeudor"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const tipoDescripcion = useMemo(
    () => tipos.find((t) => t._id === filterTipo)?.descripcion ?? "",
    [tipos, filterTipo],
  );
  const subfiltersOpciones = useMemo(
    () => getSubfilters(tipoDescripcion),
    [tipoDescripcion],
  );

  const fetchCompras = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.compras.getAll(1, 100, {
        sort: sortBy,
        order: sortOrder,
        tipo: filterTipo || undefined,
        usuario: filterUsuario || undefined,
      });
      if (res.success && res.data) {
        setCompras(res.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar gastos");
    } finally {
      setLoading(false);
    }
  }, [filterTipo, filterUsuario, sortBy, sortOrder]);

  const comprasFiltradasPorSub = useMemo(() => {
    let result = compras;
    if (filterSubcategoria) result = result.filter((c) => c.descripcion === filterSubcategoria);
    if (sectorTab === "personal") {
      result = result.filter((c) => {
        const aid = typeof c.acreedorId === "object" ? c.acreedorId._id : c.acreedorId;
        const did = typeof c.deudorId === "object" ? c.deudorId._id : c.deudorId;
        return aid === did;
      });
    } else if (sectorTab === "roomies") {
      result = result.filter((c) => {
        const aid = typeof c.acreedorId === "object" ? c.acreedorId._id : c.acreedorId;
        const did = typeof c.deudorId === "object" ? c.deudorId._id : c.deudorId;
        return aid !== did;
      });
    }
    return result;
  }, [compras, filterSubcategoria, sectorTab]);

  const fetchFormData = useCallback(async () => {
    try {
      const [tiposRes, usuariosRes] = await Promise.all([
        api.compras.getTipos(),
        api.compras.getUsuarios(),
      ]);
      if (tiposRes.success && tiposRes.data) setTipos(tiposRes.data);
      if (usuariosRes.success && usuariosRes.data)
        setRoommates(usuariosRes.data);
    } catch {
      // Silently fail for form data
    }
  }, []);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  useEffect(() => {
    fetchFormData();
  }, [fetchFormData]);

  useEffect(() => {
    if (modalOpen) fetchFormData();
  }, [modalOpen, fetchFormData]);

  useEffect(() => {
    setFilterSubcategoria("");
  }, [filterTipo]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const selectedTipoDesc =
    tipos.find((t) => t._id === form.tipo)?.descripcion ?? "";
  const formSubfilters = getSubfilters(selectedTipoDesc);
  const formNeedsDescripcion =
    isOtros(selectedTipoDesc) || !getSubfilters(selectedTipoDesc);

  const selectedDeudorIds = Object.keys(form.deudores);
  const totalDeudado = selectedDeudorIds.reduce(
    (sum, id) => sum + (parseFloat(form.deudores[id]) || 0),
    0,
  );
  const montoTotalNum = parseFloat(form.montoTotal) || 0;
  const deudoresValid =
    form.isSolo ||
    (selectedDeudorIds.length > 0 &&
      selectedDeudorIds.every(
        (id) => parseFloat(form.deudores[id]) > 0 && parseFloat(form.deudores[id]) <= montoTotalNum,
      ));

  const formCanSubmit =
    form.tipo &&
    form.montoTotal &&
    (formNeedsDescripcion ? !!form.descripcion?.trim() : !!form.descripcion) &&
    deudoresValid;

  const handleCreateCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCanSubmit) return;
    const total = parseFloat(form.montoTotal);
    try {
      setCreating(true);
      setError(null);

      if (form.isSolo) {
        await api.compras.create({
          descripcion: form.descripcion,
          montoTotal: total,
          montoDeudor: total,
          tipo: form.tipo,
        });
      } else {
        const deudores = selectedDeudorIds.map((id) => ({
          deudorId: id,
          montoDeudor: parseFloat(form.deudores[id]),
        }));
        await api.compras.createBatch({
          descripcion: form.descripcion,
          montoTotal: total,
          tipo: form.tipo,
          deudores,
        });
      }

      setForm({ descripcion: "", montoTotal: "", tipo: "", isSolo: true, deudores: {} });
      setModalOpen(false);
      await fetchCompras();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear gasto");
    } finally {
      setCreating(false);
    }
  };

  const toggleDeudor = (id: string) => {
    setForm((f) => {
      const next = { ...f.deudores };
      if (next[id] !== undefined) {
        delete next[id];
      } else {
        next[id] = "";
      }
      return { ...f, deudores: next };
    });
  };

  const splitEqually = () => {
    const ids = Object.keys(form.deudores);
    if (ids.length === 0 || !form.montoTotal) return;
    // +1 para incluir la parte del acreedor (quien paga también consume)
    const each = (parseFloat(form.montoTotal) / (ids.length + 1)).toFixed(2);
    setForm((f) => {
      const next: Record<string, string> = {};
      ids.forEach((id) => { next[id] = each; });
      return { ...f, deudores: next };
    });
  };

  const isAcreedor = (compra: Compra) => {
    const acreedorId =
      typeof compra.acreedorId === "object"
        ? compra.acreedorId._id
        : compra.acreedorId;
    return user?._id === acreedorId;
  };

  const isAceptado = (c: Compra) =>
    c.estado === "aceptado" || c.estado === undefined;

  const comprasAceptadas = comprasFiltradasPorSub.filter(isAceptado);

  const comprasPendientes = comprasFiltradasPorSub.filter(
    (c) =>
      c.estado === "pendiente" &&
      (typeof c.deudorId === "object" ? c.deudorId._id : c.deudorId) ===
        user?._id,
  );

  // Compras donde el usuario es acreedor y el deudor afirma haber pagado
  const pagoPendienteConfirmacion = comprasFiltradasPorSub.filter(
    (c) =>
      c.estado === "pago_pendiente" &&
      (typeof c.acreedorId === "object" ? c.acreedorId._id : c.acreedorId) ===
        user?._id,
  );

  const handleAccept = async (id: string) => {
    try {
      const res = await api.compras.accept(id);
      if (res.success) await Promise.all([fetchCompras(), verifyAuth()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al aceptar");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await api.compras.reject(id);
      if (res.success) await fetchCompras();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al rechazar");
    }
  };

  const handleConfirmPayment = async (id: string) => {
    try {
      const res = await api.compras.confirmPayment(id);
      if (res.success) await Promise.all([fetchCompras(), verifyAuth()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al confirmar pago");
    }
  };

  const handleRejectPayment = async (id: string) => {
    try {
      const res = await api.compras.rejectPayment(id);
      if (res.success) await fetchCompras();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al rechazar pago");
    }
  };

  const handleOpenEdit = (compra: Compra) => {
    setEditCompra(compra);
    setEditForm({
      descripcion: compra.descripcion,
      montoTotal: String(compra.montoTotal),
      montoDeudor: String(compra.montoDeudor),
      tipo: typeof compra.tipo === "object" ? compra.tipo._id : compra.tipo,
    });
    setEditModalOpen(true);
  };

  const handleEditCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompra) return;
    setEditing(true);
    setError(null);
    try {
      const res = await api.compras.update(editCompra._id, {
        descripcion: editForm.descripcion,
        montoTotal: parseFloat(editForm.montoTotal),
        montoDeudor: parseFloat(editForm.montoDeudor),
        tipo: editForm.tipo,
      });
      if (res.success) {
        setEditModalOpen(false);
        setEditCompra(null);
        await fetchCompras();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al editar el gasto");
    } finally {
      setEditing(false);
    }
  };

  const handlePay = async (acreedorId: string, compraIds?: string[]) => {
    setPayCompraIds(compraIds ?? []);
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
    setPayCompraIds([]);
    setCopied(false);
  };

  const handleNotifyPayment = async () => {
    if (payCompraIds.length === 0) return;
    setNotifyPaymentLoading(true);
    setError(null);
    try {
      await Promise.all(payCompraIds.map((id) => api.compras.requestPayment(id)));
      closePayModal();
      await fetchCompras();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al notificar pago");
    } finally {
      setNotifyPaymentLoading(false);
    }
  };

  const getAcreedorId = (c: Compra) =>
    typeof c.acreedorId === "object" ? c.acreedorId._id : c.acreedorId;
  const getDeudorId = (c: Compra) =>
    typeof c.deudorId === "object" ? c.deudorId._id : c.deudorId;
  const isSoloCompra = (c: Compra) => getAcreedorId(c) === getDeudorId(c);

  const comprasCompartidas = comprasAceptadas.filter((c) => !isSoloCompra(c));
  const teDeben = comprasCompartidas
    .filter((c) => isAcreedor(c))
    .reduce((acc, c) => acc + c.montoAcreedor, 0);
  const debes = comprasCompartidas
    .filter((c) => !isAcreedor(c))
    .reduce((acc, c) => acc + c.montoDeudor, 0);
  const gastosPersonales = comprasFiltradasPorSub
    .filter(isSoloCompra)
    .reduce((acc, c) => acc + (c.montoTotal || c.montoAcreedor || 0), 0);

  const deudasPorAcreedor = comprasCompartidas
    .filter((c) => getDeudorId(c) === user?._id)
    .reduce<
      Record<
        string,
        {
          acreedor: { _id: string; username: string; avatarUrl?: string };
          total: number;
          compras: Compra[];
        }
      >
    >((acc, c) => {
      const aid = getAcreedorId(c);
      const acreedor =
        typeof c.acreedorId === "object"
          ? c.acreedorId
          : { _id: aid, username: "?", avatarUrl: undefined };
      if (!acc[aid]) {
        acc[aid] = { acreedor, total: 0, compras: [] };
      }
      acc[aid].total += c.montoDeudor;
      acc[aid].compras.push(c);
      return acc;
    }, {});
  const deudasList = Object.values(deudasPorAcreedor);

  const sortedCompras = [...comprasFiltradasPorSub].sort((a, b) => {
    const aVal =
      sortBy === "createdAt"
        ? new Date(a.createdAt || 0).getTime()
        : sortBy === "montoTotal"
          ? a.montoTotal
          : a.montoDeudor;
    const bVal =
      sortBy === "createdAt"
        ? new Date(b.createdAt || 0).getTime()
        : sortBy === "montoTotal"
          ? b.montoTotal
          : b.montoDeudor;
    if (sortBy === "createdAt" && sortOrder === "desc")
      return (bVal as number) - (aVal as number);
    return sortOrder === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  return (
    <AppLayout>
      <Navbar
        user={user}
        balance={user?.balance ?? 0}
        onLogout={handleLogout}
        currentPath="/inicio"
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores">
          <StatCard
            label="Balance con roomies"
            value={user?.balance ?? 0}
            icon={<IoWalletOutline className="size-4" />}
            positive={(user?.balance ?? 0) >= 0}
            animationDelay={0}
          />
          <StatCard
            label="Te deben"
            value={teDeben}
            icon={<IoArrowUpOutline className="size-4" />}
            positive
            animationDelay={100}
          />
          <StatCard
            label="Debes"
            value={debes}
            icon={<IoArrowDownOutline className="size-4" />}
            positive={false}
            animationDelay={200}
          />
          <StatCard
            label="Gastos personales"
            value={gastosPersonales}
            icon={<IoPersonOutline className="size-4" />}
            neutral
            animationDelay={300}
          />
        </section>

        {deudasList.length > 0 && (
          <PageSection title="Mis deudas" className="mb-6">
            <div className="space-y-3">
              {deudasList.map(({ acreedor, total, compras }) => (
                <Card key={acreedor._id} hover={false} className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setLocation(`/user/${acreedor._id}`)}
                      className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Avatar name={acreedor.username} src={getAvatarUrl(acreedor.avatarUrl)} size="lg" variant="negative" />
                    </button>
                    <div>
                      <p className="font-medium text-sm">Debes a {acreedor.username}</p>
                      <p className="font-mono text-xs text-[#F6465D]">{formatMoney(total)}</p>
                    </div>
                  </div>
                  <Button variant="pay" size="md" onClick={() => handlePay(acreedor._id, compras.map((c) => c._id))}>
                    Pagar todo
                  </Button>
                </Card>
              ))}
            </div>
          </PageSection>
        )}

        {comprasPendientes.length > 0 && (
          <PageSection
            title="Pendientes de aceptar"
            description={`Tienes ${comprasPendientes.length} cargo(s) pendiente(s) de aceptar`}
            className="mb-6"
          >
            <div className="rounded-xl border border-[#7F00FF]/30 bg-[#7F00FF]/5 p-4">
              <ul className="space-y-2">
                {comprasPendientes.map((c) => {
                  const acreedor = typeof c.acreedorId === "object" ? c.acreedorId : null;
                  return (
                    <li
                      key={c._id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-[#2B3139]/50 bg-[#181A20]/50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.descripcion}</p>
                        <p className="text-xs text-[#848E9C]">
                          {acreedor?.username} te cobró {formatMoney(c.montoDeudor)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="outline-danger" size="sm" onClick={() => handleReject(c._id)}>
                          Rechazar
                        </Button>
                        <Button variant="success" size="sm" onClick={() => handleAccept(c._id)}>
                          Aceptar
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </PageSection>
        )}

        {pagoPendienteConfirmacion.length > 0 && (
          <PageSection
            title="Confirmaciones de pago pendientes"
            description={`${pagoPendienteConfirmacion.length} usuario(s) afirman haber pagado`}
            className="mb-6"
          >
            <div className="rounded-xl border border-[#0ECB81]/30 bg-[#0ECB81]/5 p-4">
              <ul className="space-y-2">
                {pagoPendienteConfirmacion.map((c) => {
                  const deudor = typeof c.deudorId === "object" ? c.deudorId : null;
                  return (
                    <li
                      key={c._id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-[#2B3139]/50 bg-[#181A20]/50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.descripcion}</p>
                        <p className="text-xs text-[#848E9C]">
                          <span className="font-medium text-[#0ECB81]">{deudor?.username}</span> dice haber pagado {formatMoney(c.montoDeudor)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="outline-danger" size="sm" onClick={() => handleRejectPayment(c._id)}>
                          No recibido
                        </Button>
                        <Button variant="success" size="sm" leftIcon={<IoCheckmarkDoneOutline className="size-3.5" />} onClick={() => handleConfirmPayment(c._id)}>
                          Confirmar pago
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </PageSection>
        )}

        <PageSection title="Últimos movimientos">
          {/* Sector tabs */}
          <div className="mb-4 flex gap-1 rounded-lg border border-[#2B3139]/50 bg-[#0B0E11]/30 p-1">
            {(["todos", "roomies", "personal"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSectorTab(tab)}
                className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
                  sectorTab === tab
                    ? "bg-[#7F00FF] text-white shadow"
                    : "text-[#848E9C] hover:text-white"
                }`}
              >
                {tab === "todos" ? "Todos" : tab === "roomies" ? "Con roomies" : "Personales"}
              </button>
            ))}
          </div>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-2.5 py-1.5 text-xs text-white"
              >
                <option value="">Todos los tipos</option>
                {tipos.map((t) => (
                  <option key={t._id} value={t._id}>{t.descripcion}</option>
                ))}
              </select>
              {subfiltersOpciones && (
                <select
                  value={filterSubcategoria}
                  onChange={(e) => setFilterSubcategoria(e.target.value)}
                  className="rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="">Todos</option>
                  {subfiltersOpciones.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
              <select
                value={filterUsuario}
                onChange={(e) => setFilterUsuario(e.target.value)}
                className="rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-2.5 py-1.5 text-xs text-white"
              >
                <option value="">Todos los usuarios</option>
                {roommates.map((r) => (
                  <option key={r.id} value={r.id}>{r.username}</option>
                ))}
              </select>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split("-") as [typeof sortBy, typeof sortOrder];
                  setSortBy(s);
                  setSortOrder(o);
                }}
                className="rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-2.5 py-1.5 text-xs text-white"
              >
                <option value="createdAt-desc">Más recientes</option>
                <option value="createdAt-asc">Más antiguos</option>
                <option value="montoTotal-desc">Monto mayor</option>
                <option value="montoTotal-asc">Monto menor</option>
                <option value="montoDeudor-desc">Deuda mayor</option>
                <option value="montoDeudor-asc">Deuda menor</option>
              </select>
            </div>
            <Button variant="primary" size="lg" leftIcon={<IoAdd className="size-3.5" />} onClick={() => setModalOpen(true)}>
              Nuevo gasto
            </Button>
          </div>

          {loading ? (
            <Card hover={false} className="py-16 text-center">
              <Spinner size="md" className="mx-auto mb-3" />
              <p className="text-xs text-[#848E9C]">Cargando movimientos...</p>
            </Card>
          ) : comprasFiltradasPorSub.length === 0 ? (
            <EmptyState
              icon={<IoWalletOutline className="size-6 text-[#848E9C]" />}
              title="No hay gastos registrados"
              description="Comienza registrando tu primer gasto"
              action={
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-xs font-semibold text-[#7F00FF] hover:text-[#9D00FF]"
                >
                  Registrar ahora →
                </button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 border-b border-[#2B3139]/50 bg-[#0B0E11]/30 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#848E9C]">
                <div className="col-span-5">Descripción</div>
                <div className="col-span-2 hidden sm:block">Tipo</div>
                <div className="col-span-3 hidden md:block">Usuario</div>
                <div className="col-span-2 text-right">Monto</div>
              </div>

              {/* Table body */}
              <ul>
                {sortedCompras.slice(0, 10).map((c, i) => {
                  const isSolo = isSoloCompra(c);
                  const isIn = isAcreedor(c);
                  const tipoDesc =
                    typeof c.tipo === "object" ? c.tipo.descripcion : "";
                  const acreedor =
                    typeof c.acreedorId === "object" ? c.acreedorId : null;
                  const deudor =
                    typeof c.deudorId === "object" ? c.deudorId : null;
                  const other = isIn ? deudor : acreedor;

                  return (
                    <li
                      key={c._id}
                      className="grid grid-cols-12 gap-4 items-center border-b border-[#2B3139]/40 px-4 py-3 last:border-b-0 transition-colors hover:bg-[#2B3139]/20"
                      style={{
                        animation: "fadeInUp 0.3s ease-out both",
                        animationDelay: `${i * 50}ms`,
                      }}
                    >
                      {/* Description column */}
                      <div className="col-span-5 flex min-w-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isSolo && other?._id && other._id !== user?._id) setLocation(`/user/${other._id}`);
                          }}
                          className={`shrink-0 ${!isSolo && other?._id && other._id !== user?._id ? "cursor-pointer hover:opacity-80 transition-opacity" : "cursor-default"}`}
                        >
                          <Avatar
                            name={isSolo ? "Tu" : (acreedor?.username ?? "?")}
                            src={isSolo ? undefined : getAvatarUrl(acreedor?.avatarUrl)}
                            size="md"
                            variant={isSolo ? "default" : isIn ? "positive" : "negative"}
                            ring={!isSolo}
                          />
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium truncate text-xs">
                              {c.descripcion}
                            </p>
                            {c.estado === "pendiente" && (
                              <Badge variant="pending">Pendiente</Badge>
                            )}
                            {c.estado === "pago_pendiente" && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#0ECB81]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0ECB81] border border-[#0ECB81]/20">
                                <IoTimeOutline className="size-2.5" /> Pago enviado
                              </span>
                            )}
                            {c.estado === "pagado" && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-[#0ECB81]/15 px-1.5 py-0.5 text-[10px] font-medium text-[#0ECB81] border border-[#0ECB81]/30">
                                <IoCheckmarkDoneOutline className="size-2.5" /> Pagado
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#848E9C] mt-0.5">
                            {formatDate(c.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Type column */}
                      <div className="col-span-2 hidden sm:block">
                        {tipoDesc && <Badge variant="default">{tipoDesc}</Badge>}
                      </div>

                      {/* User column */}
                      <div className="col-span-3 hidden md:block">
                        <p className="text-xs text-[#848E9C]">
                          {isSolo
                            ? "Gasto personal"
                            : isIn
                              ? `Le cobraste a ${deudor?.username || "?"}`
                              : `${acreedor?.username || "?"} te cobró`}
                        </p>
                      </div>

                      {/* Amount column */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <span
                          className={`font-mono text-sm font-semibold tabular-nums ${
                            isSolo ? "text-[#848E9C]" : c.estado === "pagado" ? "text-[#848E9C] line-through" : isIn ? "text-[#0ECB81]" : "text-[#F6465D]"
                          }`}
                        >
                          {formatMoney(isIn || isSolo ? c.montoAcreedor : c.montoDeudor)}
                        </span>
                        {/* Acreedor: puede editar mientras no esté pagado ni en proceso de pago */}
                        {isIn && c.estado !== "pagado" && c.estado !== "pago_pendiente" && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            title="Editar gasto"
                            className="shrink-0 rounded p-1 text-[#848E9C] hover:text-white transition-colors"
                          >
                            <IoPencilOutline className="size-3.5" />
                          </button>
                        )}
                        {/* Deudor: aceptado → abre modal con CBU para pagar */}
                        {!isSolo && !isIn && isAceptado(c) && (
                          <Button
                            variant="pay"
                            size="sm"
                            onClick={() => handlePay(getAcreedorId(c), [c._id])}
                            className="shrink-0"
                          >
                            Pagar
                          </Button>
                        )}
                        {/* Deudor: pago_pendiente → esperando confirmación del cobrador */}
                        {!isSolo && !isIn && c.estado === "pago_pendiente" && (
                          <span className="shrink-0 text-[10px] text-[#848E9C]">En espera</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </PageSection>
      </main>

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setForm({ descripcion: "", montoTotal: "", tipo: "", isSolo: true, deudores: {} });
        }}
        title="Nuevo gasto"
        closeDisabled={creating}
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCompra} className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="tipo"
                  className="mb-1.5 block text-xs font-semibold text-[#EAECEF]"
                >
                  Tipo
                </label>
                <select
                  id="tipo"
                  required
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      tipo: e.target.value,
                      descripcion: "",
                    }))
                  }
                  className="w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 text-sm text-white transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
                >
                  <option value="">Seleccionar tipo</option>
                  {tipos.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.descripcion}
                    </option>
                  ))}
                </select>
              </div>

              {form.tipo &&
                (formNeedsDescripcion || !formSubfilters ? (
                  <div>
                    <label
                      htmlFor="descripcion"
                      className="mb-1.5 block text-xs font-semibold text-[#EAECEF]"
                    >
                      Descripción
                    </label>
                    <input
                      id="descripcion"
                      type="text"
                      required
                      value={form.descripcion}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, descripcion: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 text-sm text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
                      placeholder="Describe el gasto"
                    />
                  </div>
                ) : formSubfilters ? (
                  <div>
                    <label
                      htmlFor="subcategoria"
                      className="mb-1.5 block text-xs font-semibold text-[#EAECEF]"
                    >
                      Subcategoría
                    </label>
                    <select
                      id="subcategoria"
                      required
                      value={form.descripcion}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, descripcion: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 text-sm text-white transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
                    >
                      <option value="">Seleccionar</option>
                      {formSubfilters.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null)}

              <div>
                <label
                  htmlFor="montoTotal"
                  className="mb-1.5 block text-xs font-semibold text-[#EAECEF]"
                >
                  Monto total ($)
                </label>
                <input
                  id="montoTotal"
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={form.montoTotal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, montoTotal: e.target.value }))
                  }
                  className="font-mono w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 text-sm text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
                  placeholder="5000"
                />
              </div>

              {/* ¿Quién te debe? */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#EAECEF]">¿Quién te debe?</label>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, isSolo: true, deudores: {} }))}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        form.isSolo
                          ? "bg-[#7F00FF] text-white"
                          : "bg-[#2B3139]/40 text-[#848E9C] hover:text-white"
                      }`}
                    >
                      Solo yo
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, isSolo: false }))}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        !form.isSolo
                          ? "bg-[#7F00FF] text-white"
                          : "bg-[#2B3139]/40 text-[#848E9C] hover:text-white"
                      }`}
                    >
                      <IoPeopleOutline className="size-3" /> Compartido
                    </button>
                  </div>
                </div>

                {!form.isSolo && (
                  <div className="rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 p-2">
                    {roommates.length === 0 ? (
                      <p className="py-2 text-center text-xs text-[#848E9C]">
                        No tienes amigos. Ve a{" "}
                        <a href="/amigos" className="text-[#7F00FF] hover:underline">Amigos</a>{" "}
                        para agregar roomies.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {roommates.map((r) => {
                          const selected = form.deudores[r.id] !== undefined;
                          return (
                            <div key={r.id} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleDeudor(r.id)}
                                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors ${
                                  selected
                                    ? "bg-[#7F00FF]/15 text-white"
                                    : "text-[#848E9C] hover:bg-[#2B3139]/40 hover:text-white"
                                }`}
                              >
                                <span
                                  className={`flex size-4 shrink-0 items-center justify-center rounded border text-[10px] transition-colors ${
                                    selected
                                      ? "border-[#7F00FF] bg-[#7F00FF] text-white"
                                      : "border-[#2B3139]"
                                  }`}
                                >
                                  {selected && <IoCheckmark />}
                                </span>
                                <span className="flex-1 text-left">{r.username}</span>
                              </button>
                              {selected && (
                                <div className="relative shrink-0">
                                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#848E9C]">$</span>
                                  <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.deudores[r.id]}
                                    onChange={(e) =>
                                      setForm((f) => ({
                                        ...f,
                                        deudores: { ...f.deudores, [r.id]: e.target.value },
                                      }))
                                    }
                                    placeholder="0"
                                    className="font-mono w-24 rounded-md border border-[#2B3139]/60 bg-[#181A20] py-1.5 pl-6 pr-2 text-xs text-white placeholder-[#848E9C] focus:border-[#7F00FF] focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectedDeudorIds.length >= 1 && form.montoTotal && (
                      <button
                        type="button"
                        onClick={splitEqually}
                        className="mt-2 w-full rounded-md border border-[#7F00FF]/30 py-1.5 text-xs font-medium text-[#7F00FF] transition-colors hover:bg-[#7F00FF]/10"
                      >
                        {selectedDeudorIds.length === 1
                          ? "Dividir en 2 (50/50)"
                          : `Dividir equitativamente (${selectedDeudorIds.length + 1} personas)`}
                      </button>
                    )}

                    {selectedDeudorIds.length > 0 && montoTotalNum > 0 && (
                      <div className="mt-2 flex items-center justify-between rounded-md bg-[#181A20]/60 px-3 py-1.5 text-xs">
                        <span className="text-[#848E9C]">Total cobrado</span>
                        <span className={`font-mono font-semibold ${totalDeudado > montoTotalNum ? "text-[#F6465D]" : "text-[#0ECB81]"}`}>
                          ${totalDeudado.toFixed(2)} / ${montoTotalNum.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {selectedDeudorIds.some(
                      (id) => parseFloat(form.deudores[id]) > montoTotalNum,
                    ) && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-[#F6465D]">
                        <IoWarningOutline className="size-3 shrink-0" />
                        El monto de algún deudor supera el monto total
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setModalOpen(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={!formCanSubmit}
                  isLoading={creating}
                >
                  {creating ? "Guardando..." : "Registrar"}
                </Button>
              </div>
            </form>
      </Modal>

      {/* Edit expense modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditCompra(null); }}
        title="Editar gasto"
        closeDisabled={editing}
        maxWidth="lg"
      >
        <form onSubmit={handleEditCompra} className="p-5 space-y-4">
          {editCompra && !isSoloCompra(editCompra) && (
            <div className="rounded-lg border border-[#7F00FF]/30 bg-[#7F00FF]/5 px-3 py-2 text-xs text-[#7F00FF]">
              Al editar un gasto aceptado, el deudor deberá volver a aceptarlo.
            </div>
          )}

          <div>
            <label htmlFor="edit-tipo" className="mb-1.5 block text-xs font-semibold text-[#EAECEF]">Tipo</label>
            <select
              id="edit-tipo"
              required
              value={editForm.tipo}
              onChange={(e) => setEditForm((f) => ({ ...f, tipo: e.target.value }))}
              className="w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 text-sm text-white transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
            >
              <option value="">Seleccionar tipo</option>
              {tipos.map((t) => (
                <option key={t._id} value={t._id}>{t.descripcion}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="edit-descripcion" className="mb-1.5 block text-xs font-semibold text-[#EAECEF]">Descripción</label>
            <input
              id="edit-descripcion"
              type="text"
              required
              value={editForm.descripcion}
              onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
              className="w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 text-sm text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
            />
          </div>

          <div>
            <label htmlFor="edit-montoTotal" className="mb-1.5 block text-xs font-semibold text-[#EAECEF]">Monto total ($)</label>
            <input
              id="edit-montoTotal"
              type="number"
              required
              min="0.01"
              step="0.01"
              value={editForm.montoTotal}
              onChange={(e) => setEditForm((f) => ({ ...f, montoTotal: e.target.value }))}
              className="font-mono w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 text-sm text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
            />
          </div>

          {editCompra && !isSoloCompra(editCompra) && (
            <div>
              <label htmlFor="edit-montoDeudor" className="mb-1.5 block text-xs font-semibold text-[#EAECEF]">
                Monto que debe el deudor ($)
              </label>
              <input
                id="edit-montoDeudor"
                type="number"
                required
                min="0.01"
                step="0.01"
                max={editForm.montoTotal}
                value={editForm.montoDeudor}
                onChange={(e) => setEditForm((f) => ({ ...f, montoDeudor: e.target.value }))}
                className="font-mono w-full rounded-lg border border-[#2B3139]/60 bg-[#0B0E11]/50 px-3 py-2.5 text-sm text-white placeholder-[#848E9C] transition-colors focus:border-[#7F00FF] focus:outline-none focus:ring-2 focus:ring-[#7F00FF]/20"
              />
            </div>
          )}

          <div className="flex gap-2 pt-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditModalOpen(false)} disabled={editing}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={editing} isLoading={editing}>
              {editing ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Modal>

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
                  <p className="text-sm text-[#848E9C]">
                    {payResult.descripcion}
                  </p>
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
                  {payCompraIds.length > 0 && (
                    <div className="pt-3 border-t border-[#2B3139]/50">
                      <Button
                        type="button"
                        variant="success"
                        size="md"
                        className="w-full"
                        onClick={handleNotifyPayment}
                        disabled={notifyPaymentLoading}
                        isLoading={notifyPaymentLoading}
                        leftIcon={<IoCheckmarkDoneOutline className="size-4" />}
                      >
                        {notifyPaymentLoading ? "Enviando..." : "Ya hice la transferencia"}
                      </Button>
                      <p className="mt-2 text-xs text-[#848E9C] text-center">
                        El cobrador deberá confirmar que recibió el pago
                      </p>
                    </div>
                  )}
                </div>
          ) : null}
        </div>
      </Modal>
    </AppLayout>
  );
}
