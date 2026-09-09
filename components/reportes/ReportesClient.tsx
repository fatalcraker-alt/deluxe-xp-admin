"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { Venta, Gasto, Fragancia } from "@/types/database";

interface Props {
  initialVentas: Venta[];
  initialGastos: Gasto[];
  fragancias: Pick<Fragancia, "id" | "nombre" | "marca">[];
  defaultMonthStart: string;
}

export default function ReportesClient({ initialVentas, initialGastos, fragancias, defaultMonthStart }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const supabase = createClient();

  const [ventas, setVentas] = useState<Venta[]>(initialVentas);
  const [gastos, setGastos] = useState<Gasto[]>(initialGastos);
  const [fechaInicio, setFechaInicio] = useState(defaultMonthStart);
  const [fechaFin, setFechaFin] = useState(today);
  const [fragFilter, setFragFilter] = useState("todas");
  const [canalFilter, setCanalFilter] = useState("todos");
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    const [vRes, gRes] = await Promise.all([
      supabase
        .from("ventas")
        .select("*, fragancia:fragancias(nombre, marca)")
        .gte("fecha", fechaInicio)
        .lte("fecha", fechaFin)
        .order("fecha"),
      supabase
        .from("gastos")
        .select("*")
        .gte("fecha", fechaInicio)
        .lte("fecha", fechaFin)
        .order("fecha"),
    ]);
    if (vRes.data) setVentas(vRes.data as Venta[]);
    if (gRes.data) setGastos(gRes.data as Gasto[]);
    setLoading(false);
  }

  const filteredVentas = useMemo(() => ventas.filter((v) => {
    const matchFrag = fragFilter === "todas" || v.fragancia_id === fragFilter;
    const matchCanal = canalFilter === "todos" || v.canal === canalFilter;
    return matchFrag && matchCanal;
  }), [ventas, fragFilter, canalFilter]);

  const ingresos = filteredVentas.reduce((s, v) => s + (v.total ?? 0), 0);
  const gastosTotal = gastos.reduce((s, g) => s + g.monto, 0);
  const margen = ingresos - gastosTotal;

  // Por fragancia
  const porFragancia = useMemo(() => {
    const map: Record<string, { nombre: string; total: number; unidades: number }> = {};
    filteredVentas.forEach((v) => {
      if (!v.fragancia_id) return;
      const nombre = (v.fragancia as any)?.nombre ?? "—";
      if (!map[v.fragancia_id]) map[v.fragancia_id] = { nombre, total: 0, unidades: 0 };
      map[v.fragancia_id].total += v.total ?? 0;
      map[v.fragancia_id].unidades += v.cantidad;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredVentas]);

  // Ventas por día para chart
  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredVentas.forEach((v) => {
      map[v.fecha] = (map[v.fecha] ?? 0) + (v.total ?? 0);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, total]) => ({ fecha: fecha.slice(5), total }));
  }, [filteredVentas]);

  const fmt = (n: number) => "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-surface border border-border p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Desde</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
              className="bg-brand-black border border-border text-brand-white font-sans text-xs px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Hasta</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
              className="bg-brand-black border border-border text-brand-white font-sans text-xs px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Fragancia</label>
            <select value={fragFilter} onChange={(e) => setFragFilter(e.target.value)}
              className="bg-brand-black border border-border text-brand-white font-sans text-xs px-3 py-2 outline-none focus:border-brand-gray transition-colors">
              <option value="todas">Todas</option>
              {fragancias.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Canal</label>
            <select value={canalFilter} onChange={(e) => setCanalFilter(e.target.value)}
              className="bg-brand-black border border-border text-brand-white font-sans text-xs px-3 py-2 outline-none focus:border-brand-gray transition-colors">
              <option value="todos">Todos</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="presencial">Presencial</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <button onClick={fetchData} disabled={loading}
            className="px-5 py-2 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase hover:bg-brand-offwhite transition-colors disabled:opacity-50">
            {loading ? "Cargando..." : "Aplicar"}
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface border border-border p-4 space-y-1">
          <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gray">Ventas totales</p>
          <p className="font-serif text-2xl text-brand-white">{filteredVentas.length}</p>
        </div>
        <div className="bg-surface border border-border p-4 space-y-1">
          <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gray">Ingresos</p>
          <p className="font-serif text-2xl text-alert-green">{fmt(ingresos)}</p>
        </div>
        <div className="bg-surface border border-border p-4 space-y-1">
          <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gray">Gastos</p>
          <p className="font-serif text-2xl text-alert-red">{fmt(gastosTotal)}</p>
        </div>
        <div className="bg-surface border border-border p-4 space-y-1">
          <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gray">Margen</p>
          <p className={`font-serif text-2xl ${margen >= 0 ? "text-alert-green" : "text-alert-red"}`}>{fmt(margen)}</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-surface border border-border p-5 space-y-4">
          <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gray">Ventas por día</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="fecha" tick={{ fill: "#7A7A7A", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#7A7A7A", fontSize: 10 }} axisLine={false} tickLine={false} width={55}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1A1A1A", border: "1px solid #2A2A2A", fontSize: 11, fontFamily: "var(--font-inter)" }}
                labelStyle={{ color: "#7A7A7A" }}
                itemStyle={{ color: "#FFFFFF" }}
                formatter={(v) => [fmt(Number(v ?? 0)), "Ventas"] as [string, string]}
              />
              <Bar dataKey="total" fill="#FFFFFF" fillOpacity={0.8} radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Por fragancia */}
      {porFragancia.length > 0 && (
        <div className="bg-surface border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="font-sans text-[10px] uppercase tracking-widest text-brand-gray">Desglose por fragancia</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-sans text-[10px] tracking-widest uppercase text-brand-gray px-5 pb-2 pt-3 pr-4">Fragancia</th>
                <th className="text-right font-sans text-[10px] tracking-widest uppercase text-brand-gray pb-2 pt-3 pr-5">Unidades</th>
                <th className="text-right font-sans text-[10px] tracking-widest uppercase text-brand-gray pb-2 pt-3 pr-5">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {porFragancia.map((f, i) => (
                <tr key={i} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-2.5 font-sans text-xs text-brand-white">{f.nombre}</td>
                  <td className="text-right pr-5 py-2.5 font-sans text-xs text-brand-gray tabular-nums">{f.unidades}</td>
                  <td className="text-right pr-5 py-2.5 font-sans text-sm text-brand-white font-medium tabular-nums">{fmt(f.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
