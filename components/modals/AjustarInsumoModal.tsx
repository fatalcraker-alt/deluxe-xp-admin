"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Insumo } from "@/types/database";

interface Props {
  insumo: Insumo;
  onClose: () => void;
  onAjustado: (insumo: Insumo) => void;
}

export default function AjustarInsumoModal({ insumo, onClose, onAjustado }: Props) {
  const supabase = createClient();
  const [cantidad, setCantidad] = useState(insumo.cantidad.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("insumos")
      .update({ cantidad: parseInt(cantidad) })
      .eq("id", insumo.id)
      .select()
      .single();

    if (error || !data) {
      setError("Error al actualizar.");
      setLoading(false);
    } else {
      onAjustado(data as Insumo);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-xs bg-surface border border-border p-6 space-y-5 sm:m-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-brand-white tracking-wide">Ajustar Stock</h2>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-white text-xl leading-none">×</button>
        </div>

        <div>
          <p className="font-sans text-sm text-brand-white">{insumo.nombre}</p>
          <p className="font-sans text-xs text-brand-gray">Actual: {insumo.cantidad} {insumo.unidad}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Nueva cantidad</label>
            <input type="number" min="0" required value={cantidad} onChange={(e) => setCantidad(e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors" />
          </div>

          {error && <p className="font-sans text-xs text-alert-red">{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-border text-brand-gray font-sans text-xs tracking-widest uppercase py-2.5 hover:border-brand-white hover:text-brand-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase py-2.5 hover:bg-brand-offwhite transition-colors disabled:opacity-50">
              {loading ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
