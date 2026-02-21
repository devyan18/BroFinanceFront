import { useAuth } from "../providers/AuthProvider";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../services/api.service";
import type { Compra } from "../types/compras";
import { IoBarChartOutline } from "react-icons/io5";
import { formatMoney } from "../utils/formatters";
import { AppLayout } from "../components/layout";
import Navbar from "../components/layout/Navbar";
import { Button, Card, EmptyState, Spinner } from "../components/ui";
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
} from "recharts";

type Periodo = "7d" | "30d" | "90d";

const COLORS = [
  "#7F00FF",
  "#0ECB81",
  "#F6465D",
  "#848E9C",
  "#9D00FF",
  "#03A66D",
];

export default function ChartsPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>("30d");

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

  const handleLogout = async () => {
    await logout();
    setLocation("/");
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
      const name = acreedor?.username ?? "?";
      map.set(name, (map.get(name) ?? 0) + c.montoTotal);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [comprasFiltradas]);

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
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-[#2B3139] bg-[#181A20] px-4 py-3 shadow-xl">
        <p className="text-xs font-semibold text-[#848E9C]">{label}</p>
        <p className="font-mono text-sm font-semibold text-white">
          {formatMoney(payload[0].value)}
        </p>
      </div>
    );
  };

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
          <div className="flex gap-2">
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
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E9C]">Total gastado</span>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-white">{formatMoney(totalGastos)}</p>
                <p className="mt-1 text-xs text-[#848E9C]">{comprasFiltradas.length} transacciones</p>
              </Card>
              <Card>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E9C]">Promedio por gasto</span>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-[#0ECB81]">{formatMoney(promedioGasto)}</p>
                <p className="mt-1 text-xs text-[#848E9C]">en el período</p>
              </Card>
              <Card>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#848E9C]">Gasto diario promedio</span>
                <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-[#7F00FF]">{formatMoney(daysBack > 0 ? totalGastos / daysBack : 0)}</p>
                <p className="mt-1 text-xs text-[#848E9C]">últimos {daysBack} días</p>
              </Card>
            </section>

            <section className="mb-6 overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
              <h2 className="mb-3 text-base font-semibold">Gastos diarios</h2>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={datosLinea}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartTheme.grid}
                    />
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
                      stroke="#7F00FF"
                      strokeWidth={2}
                      dot={{ fill: "#7F00FF", r: 3 }}
                      activeDot={{ r: 5, fill: "#9D00FF" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Área: Acumulado */}
            <section className="mb-6 overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
              <h2 className="mb-3 text-base font-semibold">Gasto acumulado</h2>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={datosAcumulado}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gradAcum" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#7F00FF"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="#7F00FF"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartTheme.grid}
                    />
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
                              ? [{ value: payload[0]?.payload.acumulado }]
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

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Barras: Por tipo */}
              <section className="overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
                <h2 className="mb-3 text-base font-semibold">Por categoría</h2>
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

              {/* Barras: Por usuario */}
              <section className="overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
                <h2 className="mb-3 text-base font-semibold">Quién pagó más</h2>
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
            </div>

            {/* Pie: Distribución por tipo */}
            {datosPorTipo.length > 0 && (
              <section className="mt-6 overflow-hidden rounded-xl border border-[#2B3139]/50 bg-[#181A20]/70 backdrop-blur-sm p-5">
                <h2 className="mb-3 text-base font-semibold">
                  Distribución por categoría
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
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
    </AppLayout>
  );
}
