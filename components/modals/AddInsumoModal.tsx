"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Insumo } from "@/types/database";

interface Props {
  onClose: () => void;
  onAdded: (insumo: Insumo) => void;
}

export default function AddInsumoModal({ onClose, onAdded }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    categoria: "frasco_10ml",
    cantidad: "",
    unidad: "piezas",
    stock_minimo: "10",
    costo_unitario: "",
  });

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("insumos")
      .insert({
        nombre: form.nombre.trim(),
        categoria: form.categoria as any,
        cantidad: parseInt(form.cantidad),
        unidad: form.unidad.trim(),
        stock_minimo: parseInt(form.stock_minimo),
        costo_unitario: parseFloat(form.costo_unitario || "0"),
      })
      .select()
      .single();

    if (error || !data) {
      setError("Error al guardar.");
      setLoading(false);
    } else {
      onAdded(data as Insumo);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-surface border border-border p-6 space-y-5 sm:m-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-brand-white tracking-wide">Nuevo Insumo</h2>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Nombre</label>
            <input required value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
              placeholder="Ej. Frascos 10ml con tapa" />
          </div>
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Categoría</label>
            <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors">
              <option value="frasco_5ml">Frasco 5 ml</option>
              <option value="frasco_10ml">Frasco 10 ml</option>
              <option value="atomizador">Atomizador</option>
              <option value="etiqueta">Etiqueta</option>
              <option value="packaging">Packaging</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Cantidad actual</label>
              <input type="number" min="0" required value={form.cantidad} onChange={(e) => set("cantidad", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Stock mínimo</label>
              <input type="number" min="0" required value={form.stock_minimo} onChange={(e) => set("stock_minimo", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Unidad</label>
              <input value={form.unidad} onChange={(e) => set("unidad", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="piezas" />
            </div>
            <div className="space-y-1">
              <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Costo unitario</label>
              <input type="number" min="0" step="0.01" value={form.costo_unitario} onChange={(e) => set("costo_unitario", e.target.value)}
                className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
                placeholder="0.00" />
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
