"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  onClose: () => void;
}

export default function AddFraganciaModal({ onClose }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    marca: "",
    concentracion: "Eau de Parfum",
    ml_original: "",
    ml_actuales: "",
    costo_adquisicion: "",
    precio_ml: "",
  });

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("fragancias").insert({
      nombre: form.nombre.trim(),
      marca: form.marca.trim(),
      concentracion: form.concentracion,
      ml_original: parseFloat(form.ml_original),
      ml_actuales: parseFloat(form.ml_actuales || form.ml_original),
      costo_adquisicion: parseFloat(form.costo_adquisicion || "0"),
      precio_ml: parseFloat(form.precio_ml || "0"),
      activo: true,
    });

    if (error) {
      setError("Error al guardar. Intenta de nuevo.");
      setLoading(false);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-surface border border-border p-6 space-y-5 sm:m-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-brand-white tracking-wide">Nueva Fragancia</h2>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-white text-xl leading-none transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Nombre</label>
              <input required value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="Ej. Dior Sauvage" />
            </div>
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Marca</label>
              <input required value={form.marca} onChange={(e) => set("marca", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="Dior" />
            </div>
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Concentración</label>
              <select value={form.concentracion} onChange={(e) => set("concentracion", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors">
                <option>Eau de Parfum</option>
                <option>Eau de Toilette</option>
                <option>Extrait de Parfum</option>
                <option>Cologne</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">ml Botella</label>
              <input required type="number" min="1" value={form.ml_original} onChange={(e) => set("ml_original", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="100" />
            </div>
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">ml Actuales</label>
              <input type="number" min="0" value={form.ml_actuales} onChange={(e) => set("ml_actuales", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="100 (si es nuevo)" />
            </div>
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Costo ($MXN)</label>
              <input type="number" min="0" step="0.01" value={form.costo_adquisicion} onChange={(e) => set("costo_adquisicion", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="1200" />
            </div>
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Precio/ml ($)</label>
              <input type="number" min="0" step="0.01" value={form.precio_ml} onChange={(e) => set("precio_ml", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="12.00" />
            </div>
          </div>

          {error && <p className="font-sans text-xs text-alert-red">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-border text-brand-gray font-sans text-xs tracking-widest uppercase py-2.5 hover:border-brand-white hover:text-brand-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase py-2.5 hover:bg-brand-offwhite transition-colors disabled:opacity-50">
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
