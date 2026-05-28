"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Fragancia } from "@/types/database";

const PRECIOS: Record<string, (precio_ml: number) => number> = {
  "5ml":     (p) => Math.round(p * 5),
  "10ml":    (p) => Math.round(p * 10),
  "completo": (p) => 0,
  "promo":   (p) => 0,
};

interface Props {
  fragancias: Pick<Fragancia, "id" | "nombre" | "marca" | "precio_ml">[];
  onClose: () => void;
}

export default function AddVentaModal({ fragancias, onClose }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split("T")[0],
    fragancia_id: "",
    tipo: "10ml" as "5ml" | "10ml" | "completo" | "promo",
    cantidad: "1",
    precio_unitario: "",
    canal: "whatsapp" as "whatsapp" | "presencial" | "otro",
    notas: "",
  });

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  function onFraganciaChange(id: string) {
    const frag = fragancias.find((f) => f.id === id);
    const precio = frag ? PRECIOS[form.tipo]?.(frag.precio_ml) : 0;
    setForm((prev) => ({
      ...prev,
      fragancia_id: id,
      precio_unitario: precio ? precio.toString() : prev.precio_unitario,
    }));
  }

  function onTipoChange(tipo: string) {
    const frag = fragancias.find((f) => f.id === form.fragancia_id);
    const precio = frag ? PRECIOS[tipo]?.(frag.precio_ml) : 0;
    setForm((prev) => ({
      ...prev,
      tipo: tipo as typeof form.tipo,
      precio_unitario: precio ? precio.toString() : prev.precio_unitario,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("ventas").insert({
      fecha: form.fecha,
      fragancia_id: form.fragancia_id || null,
      tipo: form.tipo,
      cantidad: parseInt(form.cantidad),
      precio_unitario: parseFloat(form.precio_unitario),
      canal: form.canal,
      notas: form.notas.trim() || null,
      created_by: user?.id ?? null,
    });

    if (error) {
      setError("Error al guardar. Intenta de nuevo.");
      setLoading(false);
    } else {
      onClose();
    }
  }

  const subtotal =
    (parseFloat(form.precio_unitario) || 0) * (parseInt(form.cantidad) || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-surface border border-border p-6 space-y-5 sm:m-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-brand-white tracking-wide">Nueva Venta</h2>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-white text-xl leading-none transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Fecha */}
            <div className="col-span-2 space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Fecha</label>
              <input type="date" required value={form.fecha} onChange={(e) => set("fecha", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
            </div>

            {/* Fragancia */}
            <div className="col-span-2 space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Fragancia</label>
              <select value={form.fragancia_id} onChange={(e) => onFraganciaChange(e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors">
                <option value="">— Seleccionar (opcional para promos) —</option>
                {fragancias.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre} · {f.marca}</option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Tipo</label>
              <select value={form.tipo} onChange={(e) => onTipoChange(e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors">
                <option value="5ml">Decant 5 ml</option>
                <option value="10ml">Decant 10 ml</option>
                <option value="completo">Completo</option>
                <option value="promo">Promo</option>
              </select>
            </div>

            {/* Cantidad */}
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Cantidad</label>
              <input type="number" min="1" required value={form.cantidad} onChange={(e) => set("cantidad", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
            </div>

            {/* Precio unitario */}
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Precio unitario ($)</label>
              <input type="number" min="0" step="0.01" required value={form.precio_unitario} onChange={(e) => set("precio_unitario", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="Auto o manual" />
            </div>

            {/* Canal */}
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Canal</label>
              <select value={form.canal} onChange={(e) => set("canal", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors">
                <option value="whatsapp">WhatsApp</option>
                <option value="presencial">Presencial</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Nota */}
            <div className="col-span-2 space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Nota (opcional)</label>
              <input type="text" value={form.notas} onChange={(e) => set("notas", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="Ej. cliente frecuente, combo, etc." />
            </div>
          </div>

          {/* Subtotal preview */}
          {subtotal > 0 && (
            <div className="bg-brand-black/50 border border-border px-3 py-2 flex justify-between items-center">
              <span className="font-sans text-xs text-brand-gray">Total</span>
              <span className="font-serif text-lg text-brand-white">${subtotal.toFixed(2)}</span>
            </div>
          )}

          {error && <p className="font-sans text-xs text-alert-red">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-border text-brand-gray font-sans text-xs tracking-widest uppercase py-2.5 hover:border-brand-white hover:text-brand-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase py-2.5 hover:bg-brand-offwhite transition-colors disabled:opacity-50">
              {loading ? "Guardando..." : "Registrar venta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
