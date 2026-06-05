"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import type { DeudaPepillo, TipoDeuda } from "@/types/database";
import AddDeudaModal from "@/components/modals/AddDeudaModal";

const TIPO_LABEL: Record<TipoDeuda, string> = {
  tarjeta_credito: "Tarjeta de crédito",
  prestamo_meses: "Préstamo a meses",
  dinero_extra: "Dinero extra",
  apuestas: "Apuestas",
  otro: "Otro",
};

const TIPO_ICON: Record<TipoDeuda, string> = {
  tarjeta_credito: "💳",
  prestamo_meses: "📅",
  dinero_extra: "💵",
  apuestas: "🎰",
  otro: "📌",
};

function moodEmoji(total: number): string {
  if (total === 0) return "😄";
  if (total < 300) return "🙂";
  if (total < 700) return "😐";
  if (total < 1500) return "😟";
  return "😢";
}

function moodLabel(total: number): string {
  if (total === 0) return "Sin deudas — ¡todo bien!";
  if (total < 300) return "Deuda baja";
  if (total < 700) return "Moderado";
  if (total < 1500) return "Ojo con esto";
  return "Deuda alta";
}

function buildChartData(deudas: DeudaPepillo[]) {
  type Event = { date: string; delta: number };
  const events: Event[] = [];

  for (const d of deudas) {
    const addDate = d.created_at.slice(0, 10);
    events.push({ date: addDate, delta: d.monto });
    if (d.estado === "pagado" && d.fecha_pago) {
      events.push({ date: d.fecha_pago, delta: -d.monto });
    }
  }

  events.sort((a, b) => a.date.localeCompare(b.date));

  let running = 0;
  const byDate: Record<string, number> = {};
  for (const e of events) {
    running += e.delta;
    byDate[e.date] = Math.max(0, running);
  }

  return Object.entries(byDate).map(([date, total]) => ({
    fecha: date.slice(0, 7), // YYYY-MM
    total: Number(total.toFixed(2)),
  }));
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.slice(0, 10).split("-");
  return `${day}/${m}/${y}`;
}

function isVencido(fecha: string | null): boolean {
  if (!fecha) return false;
  return new Date(fecha) < new Date();
}

interface Props {
  initialDeudas: DeudaPepillo[];
  isAdmin: boolean;
}

export default function PepilloClient({ initialDeudas, isAdmin }: Props) {
  const supabase = createClient();
  const [deudas, setDeudas] = useState<DeudaPepillo[]>(initialDeudas);
  const [showModal, setShowModal] = useState(false);
  const [showPagadas, setShowPagadas] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendientes = deudas.filter((d) => d.estado === "pendiente");
  const pagadas = deudas.filter((d) => d.estado === "pagado");
  const totalActual = pendientes.reduce((s, d) => s + d.monto, 0);
  const totalHistorico = deudas.reduce((s, d) => s + d.monto, 0);
  const chartData = buildChartData(deudas);

  async function handlePagar(id: string) {
    setLoadingId(id);
    const hoy = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("deudas_pepillo")
      .update({ estado: "pagado", fecha_pago: hoy })
      .eq("id", id)
      .select()
      .single();
    if (data) {
      setDeudas((prev) =>
        prev.map((d) => (d.id === id ? (data as DeudaPepillo) : d))
      );
    }
    setLoadingId(null);
  }

  async function handleEliminar(id: string) {
    if (!confirm("¿Eliminar esta deuda?")) return;
    await supabase.from("deudas_pepillo").delete().eq("id", id);
    setDeudas((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <>
      {showModal && (
        <AddDeudaModal
          onClose={() => setShowModal(false)}
          onAdded={(d) => setDeudas((prev) => [...prev, d])}
        />
      )}

      {/* ── Carita + totales ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Carita */}
        <div className="bg-surface border border-border p-6 flex flex-col items-center justify-center gap-2">
          <span className="text-6xl leading-none">{moodEmoji(totalActual)}</span>
          <p className="font-sans text-xs tracking-widest uppercase text-brand-gray mt-1">
            {moodLabel(totalActual)}
          </p>
        </div>

        {/* Deuda actual */}
        <div className="bg-surface border border-border p-6 flex flex-col justify-between">
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray">Deuda actual</p>
          <p className={`font-serif text-3xl mt-2 ${totalActual > 0 ? "text-alert-red" : "text-alert-green"}`}>
            ${totalActual.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
          <p className="font-sans text-xs text-brand-gray mt-1">{pendientes.length} deuda{pendientes.length !== 1 ? "s" : ""} pendiente{pendientes.length !== 1 ? "s" : ""}</p>
        </div>

        {/* Total histórico */}
        <div className="bg-surface border border-border p-6 flex flex-col justify-between">
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray">Total histórico</p>
          <p className="font-serif text-3xl text-brand-white mt-2">
            ${totalHistorico.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </p>
          <p className="font-sans text-xs text-brand-gray mt-1">{deudas.length} registro{deudas.length !== 1 ? "s" : ""} en total</p>
        </div>
      </div>

      {/* ── Gráfica ── */}
      {chartData.length > 1 && (
        <div className="bg-surface border border-border p-6">
          <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray mb-4">Evolución de deuda</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="deudaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#666" }} />
              <YAxis tick={{ fontSize: 10, fill: "#666" }} tickFormatter={(v) => `$${v}`} width={55} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 0 }}
                labelStyle={{ color: "#999", fontSize: 10 }}
                formatter={(v) => [`$${Number(v).toLocaleString("es-MX")}`, "Deuda"]}
              />
              <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} fill="url(#deudaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Header pendientes + botón ── */}
      <div className="flex items-center justify-between">
        <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray">
          Pendientes ({pendientes.length})
        </p>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="font-sans text-xs tracking-widest uppercase text-brand-white border border-border px-4 py-2 hover:bg-surface-hover transition-colors"
          >
            + Registrar deuda
          </button>
        )}
      </div>

      {/* ── Lista pendientes ── */}
      {pendientes.length === 0 ? (
        <div className="bg-surface border border-border p-8 text-center">
          <p className="text-3xl mb-2">😄</p>
          <p className="font-sans text-xs text-brand-gray tracking-wider">Sin deudas pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendientes
            .sort((a, b) => {
              const fa = a.fecha_limite ?? a.fecha_realizacion ?? a.created_at;
              const fb = b.fecha_limite ?? b.fecha_realizacion ?? b.created_at;
              return fa.localeCompare(fb);
            })
            .map((d) => (
              <DeudaCard
                key={d.id}
                deuda={d}
                isAdmin={isAdmin}
                loadingId={loadingId}
                onPagar={handlePagar}
                onEliminar={handleEliminar}
              />
            ))}
        </div>
      )}

      {/* ── Pagadas (colapsable) ── */}
      {pagadas.length > 0 && (
        <div>
          <button
            onClick={() => setShowPagadas((v) => !v)}
            className="font-sans text-[10px] tracking-widest uppercase text-brand-gray hover:text-brand-white transition-colors"
          >
            {showPagadas ? "▾" : "▸"} Pagadas ({pagadas.length})
          </button>
          {showPagadas && (
            <div className="space-y-3 mt-3">
              {pagadas.map((d) => (
                <DeudaCard
                  key={d.id}
                  deuda={d}
                  isAdmin={isAdmin}
                  loadingId={loadingId}
                  onPagar={handlePagar}
                  onEliminar={handleEliminar}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function DeudaCard({
  deuda: d,
  isAdmin,
  loadingId,
  onPagar,
  onEliminar,
}: {
  deuda: DeudaPepillo;
  isAdmin: boolean;
  loadingId: string | null;
  onPagar: (id: string) => void;
  onEliminar: (id: string) => void;
}) {
  const tipo = d.tipo as TipoDeuda;
  const pagado = d.estado === "pagado";
  const vencido = !pagado && isVencido(d.fecha_limite);
  const fechaDisplay = d.fecha_limite
    ? formatDate(d.fecha_limite)
    : formatDate(d.fecha_realizacion ?? d.created_at.slice(0, 10));
  const fechaLabel = d.fecha_limite ? "Límite" : "Registrado";

  return (
    <div
      className={`bg-surface border p-4 flex flex-col gap-2 ${
        pagado ? "border-border opacity-60" : vencido ? "border-alert-red" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg leading-none shrink-0">{TIPO_ICON[tipo]}</span>
          <div className="min-w-0">
            <p className="font-sans text-xs tracking-widest uppercase text-brand-gray">
              {TIPO_LABEL[tipo]}
              {vencido && (
                <span className="ml-2 text-alert-red">· Vencido</span>
              )}
              {pagado && (
                <span className="ml-2 text-alert-green">· Pagado</span>
              )}
            </p>
            {d.descripcion && (
              <p className="font-sans text-sm text-brand-white mt-0.5 truncate">{d.descripcion}</p>
            )}
          </div>
        </div>
        <p className={`font-serif text-xl shrink-0 ${pagado ? "text-brand-gray" : "text-brand-white"}`}>
          ${d.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-sans text-[10px] text-brand-gray tracking-wider">
          {fechaLabel}: {fechaDisplay}
          {pagado && d.fecha_pago && ` · Pagado: ${formatDate(d.fecha_pago)}`}
        </p>
        {isAdmin && !pagado && (
          <div className="flex gap-2">
            <button
              onClick={() => onPagar(d.id)}
              disabled={loadingId === d.id}
              className="font-sans text-[10px] tracking-widest uppercase px-3 py-1.5 bg-brand-white text-brand-black hover:bg-brand-offwhite transition-colors disabled:opacity-50"
            >
              {loadingId === d.id ? "..." : "✓ Pagado"}
            </button>
            <button
              onClick={() => onEliminar(d.id)}
              className="font-sans text-[10px] tracking-widest uppercase px-3 py-1.5 border border-border text-brand-gray hover:text-brand-white hover:border-brand-white transition-colors"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

