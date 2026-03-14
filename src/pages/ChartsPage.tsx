import { useAuth } from "../providers/AuthProvider";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api.service";
import type { Compra } from "../types/compras";
import {
  IoBarChartOutline,
  IoOptionsOutline,
  IoAddOutline,
  IoTrashOutline,
  IoEyeOutline,
  IoEyeOffOutline,
} from "react-icons/io5";
import { formatMoney } from "../utils/formatters";
import { AppLayout } from "../components/layout";
import Navbar from "../components/layout/Navbar";
import { Button, Card, EmptyState, Spinner, Modal } from "../components/ui";
import {
  getChartPreferences,
  setChartPreferences,
  CHART_COLORS,
  type ChartId,
  type ChartPreferences,
} from "../utils/chartPreferences";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";

type Periodo = "7d" | "30d" | "90d";

const CHART_LABELS: Record<ChartId, string> = {
  dailyTotal: "Gastos diarios",
  accumulated: "Gasto acumulado",
  byCategory: "Por categoría",
  byUser: "Gastos por pagador",
  comparativeLines: "Líneas comparativas",
  pieDistribution: "Distribución por categoría",
};

export default function ChartsPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>("30d");
  const [prefs, setPrefs] = useState<ChartPreferences>({
    visibleCharts: [],
    comparativeSeries: [],
  });
  const [customizeOpen, setCustomizeOpen] = useState(false);

  const fetchCompras = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.compras.getAll(1, 500);
      if (res.success && res.data) {
        setCompras(res.data);
      }
    } catch {
      setCompras([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  useEffect(() => {
    if (user?._id) {
      setPrefs(getChartPreferences(user._id));
    }
  }, [user?._id]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const savePrefs = useCallback(
    (next: ChartPreferences) => {
      setPrefs(next);
      if (user?._id) setChartPreferences(user._id, next);
    },
    [user?._id],
  );

  const toggleChart = (id: ChartId) => {
    const visible = prefs.visibleCharts.includes(id)
      ? prefs.visibleCharts.filter((c) => c !== id)
      : [...prefs.visibleCharts, id];
    savePrefs({ ...prefs, visibleCharts: visible });
  };

  const addComparativeSeries = (option: { dataKey: string; label: string }) => {
    const used = new Set(prefs.comparativeSeries.map((s) => s.dataKey));
    if (used.has(option.dataKey)) return;
    const color = CHART_COLORS[prefs.comparativeSeries.length % CHART_COLORS.length];
    savePrefs({
      ...prefs,
      comparativeSeries: [
        ...prefs.comparativeSeries,
        { id: option.dataKey, label: option.label, dataKey: option.dataKey, color },
      ],
    });
  };

  const removeComparativeSeries = (id: string) => {
    savePrefs({
      ...prefs,
      comparativeSeries: prefs.comparativeSeries.filter((s) => s.id !== id),
    });
  };

  const setSeriesColor = (id: string, color: string) => {
    savePrefs({
      ...prefs,
      comparativeSeries: prefs.comparativeSeries.map((s) =>
        s.id === id ? { ...s, color } : s,
      ),
    });
  };

  const daysBack = periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
  const cutoff = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    return d.getTime();
  }, [daysBack]);

  const comprasFiltradas = useMemo(
    () =>
      compras.filter((c) => {
        const ts = c.createdAt ? new Date(c.createdAt).getTime() : 0;
        const isAceptado = c.estado === "aceptado" || c.estado === undefined;
        return ts >= cutoff && isAceptado;
      }),
    [compras, cutoff],
  );

  const totalGastos = useMemo(
    () => comprasFiltradas.reduce((acc, c) => acc + c.montoTotal, 0),
    [comprasFiltradas],
  );

  const promedioGasto = useMemo(
    () => (comprasFiltradas.length ? totalGastos / comprasFiltradas.length : 0),
    [comprasFiltradas.length, totalGastos],
  );

  const categoryNames = useMemo(() => {
    const set = new Set<string>();
    comprasFiltradas.forEach((c) => {
      const tipoDesc = typeof c.tipo === "object" ? c.tipo.descripcion : "Otro";
      set.add(tipoDesc);
    });
    return Array.from(set).sort();
  }, [comprasFiltradas]);

  const userIdToLabel = useMemo(() => {
    const map = new Map<string, string>();
    const otherIds = new Set<string>();
    comprasFiltradas.forEach((c) => {
      const acreedor = typeof c.acreedorId === "object" ? c.acreedorId : null;
      const id = (acreedor && typeof acreedor === "object" && "_id" in acreedor ? acreedor._id : acreedor) as string;
      if (!id) return;
      if (id === user?._id) {
        map.set(id, "Mis gastos");
      } else {
        otherIds.add(id);
      }
    });
    Array.from(otherIds).sort().forEach((id, i) => map.set(id, `Roomie ${i + 1}`));
    return map;
  }, [comprasFiltradas, user?._id]);

  const userLabels = useMemo(
    () => Array.from(new Set(userIdToLabel.values())).sort((a, b) => (a === "Mis gastos" ? -1 : b === "Mis gastos" ? 1 : a.localeCompare(b))),
    [userIdToLabel],
  );

  const datosLinea = useMemo(() => {
    const porDia = new Map<string, number>();
    for (let i = daysBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      porDia.set(key, 0);
    }
    comprasFiltradas.forEach((c) => {
      if (!c.createdAt) return;
      const key = new Date(c.createdAt).toISOString().slice(0, 10);
      porDia.set(key, (porDia.get(key) ?? 0) + c.montoTotal);
    });
    return Array.from(porDia.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([fecha, total]) => ({
        fechaKey: fecha,
        fecha: new Date(fecha).toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "short",
        }),
        total,
      }));
  }, [comprasFiltradas, daysBack]);

  const datosAcumulado = useMemo(() => {
    let acu = 0;
    return datosLinea.map((d) => {
      acu += d.total;
      return { ...d, acumulado: acu };
    });
  }, [datosLinea]);

  const datosComparativo = useMemo(() => {
    type Row = { fechaKey: string; fecha: string; total: number; acumulado: number; [k: string]: string | number };
    const rows: Row[] = datosLinea.map((d) => ({
      ...d,
      acumulado: 0,
      ...Object.fromEntries(categoryNames.map((n) => [n, 0])),
      ...Object.fromEntries(userLabels.map((n) => [n, 0])),
    }));
    comprasFiltradas.forEach((c) => {
      if (!c.createdAt) return;
      const key = new Date(c.createdAt).toISOString().slice(0, 10);
      const row = rows.find((r) => r.fechaKey === key);
      if (!row) return;
      const tipoDesc = typeof c.tipo === "object" ? c.tipo.descripcion : "Otro";
      const acreedor = typeof c.acreedorId === "object" ? c.acreedorId : null;
      const userId = (acreedor && typeof acreedor === "object" && "_id" in acreedor ? acreedor._id : acreedor) as string;
      const userLabel = userId ? userIdToLabel.get(userId) : null;
      if (categoryNames.includes(tipoDesc)) row[tipoDesc] = (row[tipoDesc] as number ?? 0) + c.montoTotal;
      if (userLabel && userLabels.includes(userLabel)) row[userLabel] = (row[userLabel] as number ?? 0) + c.montoTotal;
    });
    let acu = 0;
    rows.forEach((r) => {
      acu += r.total;
      r.acumulado = acu;
    });
    return rows;
  }, [datosLinea, comprasFiltradas, categoryNames, userLabels, userIdToLabel]);

  const datosPorTipo = useMemo(() => {
    const map = new Map<string, number>();
    comprasFiltradas.forEach((c) => {
      const tipoDesc = typeof c.tipo === "object" ? c.tipo.descripcion : "Otro";
      const sub = c.descripcion?.trim();
      const key = sub ? `${tipoDesc} - ${sub}` : tipoDesc;
      map.set(key, (map.get(key) ?? 0) + c.montoTotal);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [comprasFiltradas]);

  const datosPorUsuario = useMemo(() => {
    const map = new Map<string, number>();
    comprasFiltradas.forEach((c) => {
      const acreedor = typeof c.acreedorId === "object" ? c.acreedorId : null;
      const userId = (acreedor && typeof acreedor === "object" && "_id" in acreedor ? acreedor._id : acreedor) as string;
      const label = userId ? userIdToLabel.get(userId) ?? "Otro" : "Otro";
      map.set(label, (map.get(label) ?? 0) + c.montoTotal);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [comprasFiltradas, userIdToLabel]);

  const visibleCharts = useMemo(() => {
    const v = prefs.visibleCharts;
    if (v.length === 0) {
      return [
        "dailyTotal",
        "accumulated",
        "comparativeLines",
        "byCategory",
        "byUser",
        "pieDistribution",
      ] as ChartId[];
    }
    return v;
  }, [prefs.visibleCharts]);

  const chartTheme = {
    grid: "#2B3139",
    text: "#848E9C",
    tooltipBg: "#181A20",
    tooltipBorder: "#2B3139",
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-[#2B3139] bg-[#181A20] px-4 py-3 shadow-xl min-w-[140px]">
        <p className="text-xs font-semibold text-[#848E9C] mb-2">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="text-xs" style={{ color: p.color }}>
              {p.name}
            </span>
            <span className="font-mono text-sm font-semibold text-white">
              {formatMoney(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const availableSeriesOptions = useMemo(() => {
    const opts: { dataKey: string; label: string }[] = [
      { dataKey: "total", label: "Total diario" },
      { dataKey: "acumulado", label: "Acumulado" },
    ];
    categoryNames.forEach((n) => opts.push({ dataKey: n, label: `Cat: ${n}` }));
    userLabels.forEach((n) => opts.push({ dataKey: n, label: n }));
    return opts;
  }, [categoryNames, userLabels]);

  return (
    <AppLayout>
      <Navbar
        user={user}
        balance={user?.balance ?? 0}
        onLogout={handleLogout}
        currentPath="/charts"
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold">Estadísticas de gastos</h1>
          <div className="flex flex-wrap gap-2">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <Button
                key={p}
                variant={periodo === p ? "primary" : "secondary"}
                size="md"
                onClick={() => setPeriodo(p)}
              >
                {p === "7d" ? "7 días" : p === "30d" ? "30 días" : "90 días"}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="md"
              leftIcon={<IoOptionsOutline className="size-4" />}
              onClick={() => setCustomizeOpen(true)}
            >
              Personalizar gráficos
            </Button>
          </div>
        </div>

        {loading ? (
          <Card hover={false} className="flex min-h-[400px] items-center justify-center">
            <Spinner size="lg" />
          </Card>
        ) : comprasFiltradas.length === 0 ? (
          <EmptyState
            icon={<IoBarChartOutline className="size-6 text-[#848E9C]" />}
            title="No hay gastos en este período"
            description="Registra gastos para ver las gráficas"
          />
        ) : (
          <>
            <section className="mb-6 grid gap-3 sm:grid-cols-3">
              <Card>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E9C]">
                  Total gastado
                </span>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-white">
                  {formatMoney(totalGastos)}
                </p>
                <p className="mt-1 text-xs text-[#848E9C]">
                  {comprasFiltradas.length} transacciones
                </p>
              </Card>
              <Card>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E9C]">
                  Promedio por gasto
                </span>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-[#0ECB81]">
                  {formatMoney(promedioGasto)}
                </p>
                <p className="mt-1 text-xs text-[#848E9C]">en el período</p>
              </Card>
              <Card>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E9C]">
                  Gasto diario promedio
                </span>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-[#7F00FF]">
                  {formatMoney(daysBack > 0 ? totalGastos / daysBack : 0)}
                </p>
                <p className="mt-1 text-xs text-[#848E9C]">últimos {daysBack} días</p>
              </Card>
            </section>

            {visibleCharts.includes("dailyTotal") && (
              <section className="mb-6 overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
                <h2 className="mb-3 text-base font-semibold">{CHART_LABELS.dailyTotal}</h2>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={datosLinea}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis
                        dataKey="fecha"
                        stroke={chartTheme.text}
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke={chartTheme.text}
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke="#7F00FF"
                        strokeWidth={2}
                        dot={{ fill: "#7F00FF", r: 3 }}
                        activeDot={{ r: 5, fill: "#9D00FF" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {visibleCharts.includes("accumulated") && (
              <section className="mb-6 overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
                <h2 className="mb-3 text-base font-semibold">{CHART_LABELS.accumulated}</h2>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={datosAcumulado}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="gradAcum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7F00FF" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#7F00FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis
                        dataKey="fecha"
                        stroke={chartTheme.text}
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis
                        stroke={chartTheme.text}
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => (
                          <CustomTooltip
                            active={active}
                            payload={
                              payload
                                ? [{ name: "Acumulado", value: payload[0]?.payload.acumulado, color: "#7F00FF" }]
                                : undefined
                            }
                            label={label != null ? String(label) : undefined}
                          />
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="acumulado"
                        stroke="#7F00FF"
                        strokeWidth={2}
                        fill="url(#gradAcum)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {visibleCharts.includes("comparativeLines") && (
              <section className="mb-6 overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
                <h2 className="mb-3 text-base font-semibold">{CHART_LABELS.comparativeLines}</h2>
                {prefs.comparativeSeries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#848E9C]">
                    Agrega series desde &quot;Personalizar gráficos&quot; para comparar total, categorías o usuarios.
                  </p>
                ) : (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={datosComparativo}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis
                          dataKey="fecha"
                          stroke={chartTheme.text}
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke={chartTheme.text}
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: 12 }}
                          formatter={(value, entry) => (
                            <span style={{ color: entry?.color ?? chartTheme.text }}>{value}</span>
                          )}
                        />
                        {prefs.comparativeSeries.map((s) => (
                          <Line
                            key={s.id}
                            type="monotone"
                            dataKey={s.dataKey}
                            name={s.label}
                            stroke={s.color}
                            strokeWidth={2}
                            dot={{ fill: s.color, r: 2 }}
                            activeDot={{ r: 4, fill: s.color }}
                            connectNulls
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </section>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              {visibleCharts.includes("byCategory") && (
                <section className="overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
                  <h2 className="mb-3 text-base font-semibold">{CHART_LABELS.byCategory}</h2>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={datosPorTipo}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={chartTheme.grid}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          stroke={chartTheme.text}
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke={chartTheme.text}
                          fontSize={12}
                          tickLine={false}
                          width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="value"
                          fill="#7F00FF"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {visibleCharts.includes("byUser") && (
                <section className="overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
                  <h2 className="mb-3 text-base font-semibold">{CHART_LABELS.byUser}</h2>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={datosPorUsuario}
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={chartTheme.grid}
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          stroke={chartTheme.text}
                          fontSize={12}
                          tickLine={false}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke={chartTheme.text}
                          fontSize={12}
                          tickLine={false}
                          width={80}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="value"
                          fill="#0ECB81"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
            </div>

            {visibleCharts.includes("pieDistribution") && datosPorTipo.length > 0 && (
              <section className="mt-6 overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
                <h2 className="mb-3 text-base font-semibold">
                  {CHART_LABELS.pieDistribution}
                </h2>
                <div className="mx-auto h-[320px] w-full max-w-md">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosPorTipo}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={{ stroke: chartTheme.text }}
                      >
                        {datosPorTipo.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number | undefined) => [
                          formatMoney(value ?? 0),
                          "Total",
                        ]}
                        contentStyle={{
                          backgroundColor: chartTheme.tooltipBg,
                          border: `1px solid ${chartTheme.tooltipBorder}`,
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: chartTheme.text }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Modal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        title="Personalizar gráficos"
        maxWidth="lg"
      >
        <div className="space-y-6 px-5 py-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">
              Gráficos visibles
            </h3>
            <p className="mb-3 text-xs text-[#848E9C]">
              Marca qué bloques quieres ver en la página.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(
                [
                  "dailyTotal",
                  "accumulated",
                  "comparativeLines",
                  "byCategory",
                  "byUser",
                  "pieDistribution",
                ] as ChartId[]
              ).map((id) => {
                const visible = visibleCharts.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleChart(id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                      visible
                        ? "border-[#7F00FF] bg-[#7F00FF]/10 text-white"
                        : "border-[#2B3139] bg-[#181A20] text-[#848E9C] hover:border-[#2B3139]/80"
                    }`}
                  >
                    {visible ? (
                      <IoEyeOutline className="size-4 shrink-0 text-[#7F00FF]" />
                    ) : (
                      <IoEyeOffOutline className="size-4 shrink-0" />
                    )}
                    {CHART_LABELS[id]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-white">
              Líneas comparativas
            </h3>
            <p className="mb-3 text-xs text-[#848E9C]">
              Elige qué series mostrar en el gráfico de líneas comparativas (total, acumulado, categorías, usuarios) y su color.
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {prefs.comparativeSeries.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-lg border border-[#2B3139] bg-[#181A20] px-3 py-2"
                >
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => setSeriesColor(s.id, e.target.value)}
                    className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                    title="Color"
                  />
                  <span className="text-sm text-white">{s.label}</span>
                  <button
                    type="button"
                    onClick={() => removeComparativeSeries(s.id)}
                    className="rounded p-1 text-[#848E9C] hover:bg-[#2B3139] hover:text-white"
                    aria-label="Quitar"
                  >
                    <IoTrashOutline className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#848E9C]">Agregar:</span>
              {availableSeriesOptions
                .filter(
                  (o) => !prefs.comparativeSeries.some((s) => s.dataKey === o.dataKey),
                )
                .map((o) => (
                  <Button
                    key={o.dataKey}
                    variant="secondary"
                    size="sm"
                    leftIcon={<IoAddOutline className="size-3" />}
                    onClick={() => addComparativeSeries(o)}
                  >
                    {o.label}
                  </Button>
                ))}
              {availableSeriesOptions.every((o) =>
                prefs.comparativeSeries.some((s) => s.dataKey === o.dataKey),
              ) && (
                <span className="text-xs text-[#848E9C]">Todas las series agregadas</span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
