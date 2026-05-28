"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { Fragancia } from "@/types/database";

interface Props {
  ingresosHoy: number;
  ingresosSemana: number;
  ingresosMes: number;
  gastosMes: number;
  margenMes: number;
  ventasHoyCount: number;
  topFragancias: { nombre: string; total: number; unidades: number }[];
  alertasInventario: Fragancia[];
  chartData: { fecha: string; total: number }[];
}

function StatCard({ label, value, sub, color = "text-brand-white" }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="bg-surface border border-border p-5 space-y-1">
      <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray">{label}</p>
      <p className={`font-serif text-2xl md:text-3xl ${color}`}>{value}</p>
      {sub && <p className="font-sans text-[10px] text-brand-gray/60">{sub}</p>}
    </div>
  );
}

export default function DashboardClient({
  ingresosHoy, ingresosSemana, ingresosMes, gastosMes, margenMes,
  ventasHoyCount, topFragancias, alertasInventario, chartData,
}: Props) {
  const fmt = (n: number) =>
    "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alertasInventario.length > 0 && (
        <div className="bg-alert-red/10 border border-alert-red/30 px-4 py-3">
          <p className="font-sans text-xs text-alert-red tracking-wider uppercase font-medium mb-1">
            Inventario crítico — {alertasInventario.length} fragancia{alertasInventario.length > 1 ? "s" : ""} por agotarse
          </p>
          <p className="font-sans text-xs text-alert-red/70">
            {alertasInventario.map((f) => `${f.nombre} (${Math.round((f.ml_actuales / f.ml_original) * 100)}%)`).join(" · ")}
          </p>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Ventas hoy" value={fmt(ingresosHoy)} sub={`${ventasHoyCount} transacciones`} />
        <StatCard label="Ventas semana" value={fmt(ingresosSemana)} />
        <StatCard label="Ingresos del mes" value={fmt(ingresosMes)} color="text-alert-green" />
        <StatCard label="Gastos del mes" value={fmt(gastosMes)} color="text-alert-red" />
      </div>

      {/* Margen */}
      <div className="bg-surface border border-border p-5 flex items-center justify-between">
        <div>
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray">Margen neto del mes</p>
          <p className={`font-serif text-3xl md:text-4xl mt-1 ${margenMes >= 0 ? "text-alert-green" : "text-alert-red"}`}>
            {fmt(margenMes)}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="font-sans text-[10px] text-brand-gray">Ingresos - Gastos</p>
          <p className="font-sans text-xs text-brand-gray/60 mt-0.5">{fmt(ingresosMes)} - {fmt(gastosMes)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Gráfica */}
        <div className="lg:col-span-2 bg-surface border border-border p-5 space-y-4">
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray">Ventas del mes</p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="fecha" tick={{ fill: "#7A7A7A", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#7A7A7A", fontSize: 10 }} axisLine={false} tickLine={false} width={55}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 0, fontSize: 11, fontFamily: "var(--font-inter)" }}
                  labelStyle={{ color: "#7A7A7A" }}
                  itemStyle={{ color: "#FFFFFF" }}
                  formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Ventas"] as [string, string]}
                />
                <Area type="monotone" dataKey="total" stroke="#FFFFFF" strokeWidth={1.5} fill="url(#totalGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-brand-gray font-sans text-xs">
              Sin ventas este mes
            </div>
          )}
        </div>

        {/* Top fragancias */}
        <div className="bg-surface border border-border p-5 space-y-4">
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray">Top fragancias (mes)</p>
          {topFragancias.length === 0 ? (
            <p className="text-brand-gray font-sans text-xs">Sin datos aún.</p>
          ) : (
            <div className="space-y-3">
              {topFragancias.map((f, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-sans text-xs text-brand-white truncate max-w-[140px]">{f.nombre}</p>
                    <p className="font-sans text-xs text-brand-white tabular-nums">{fmt(f.total)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-0.5 bg-surface-elevated">
                      <div
                        className="h-full bg-brand-white/40"
                        style={{ width: `${Math.round((f.total / (topFragancias[0]?.total || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="font-sans text-[10px] text-brand-gray tabular-nums">{f.unidades} uds</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
