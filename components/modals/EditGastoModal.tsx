"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Gasto } from "@/types/database";

interface Props {
  gasto: Gasto;
  onClose: () => void;
  onSaved: (updated: Gasto) => void;
}

export default function EditGastoModal({ gasto, onClose, onSaved }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fecha: gasto.fecha,
    categoria: gasto.categoria,
    descripcion: gasto.descripcion,
    monto: String(gasto.monto),
  });

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("gastos")
      .update({
        fecha: form.fecha,
        categoria: form.categoria,
        descripcion: form.descripcion.trim(),
        monto: parseFloat(form.monto),
      })
      .eq("id", gasto.id)
      .select()
      .single();

    if (err || !data) {
      setError("Error al guardar. Intenta de nuevo.");
      setLoading(false);
    } else {
      onSaved(data as Gasto);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-surface border border-border p-6 space-y-5 sm:m-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-brand-white tracking-wide">Editar Gasto</h2>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-white text-xl leading-none transition-colors">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Fecha</label>
            <input type="date" required value={form.fecha} onChange={(e) => set("fecha", e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Categoría</label>
            <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors">
              <option value="insumos">Insumos</option>
              <option value="envio">Envío</option>
              <option value="publicidad">Publicidad</option>
              <option value="reposicion">Reposición de fragancia</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Descripción</label>
            <input required value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Monto ($MXN)</label>
            <input type="number" min="0.01" step="0.01" required value={form.monto} onChange={(e) => set("monto", e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
          </div>

          {error && <p className="font-sans text-xs text-alert-red">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-border text-brand-gray font-sans text-xs tracking-widest uppercase py-2.5 hover:border-brand-white hover:text-brand-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase py-2.5 hover:bg-brand-offwhite transition-colors disabled:opacity-50">
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
