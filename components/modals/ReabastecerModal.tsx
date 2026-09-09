"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Fragancia } from "@/types/database";

interface Props {
  fragancia: Fragancia;
  onClose: () => void;
}

export default function ReabastecerModal({ fragancia, onClose }: Props) {
  const supabase = createClient();
  const [ml, setMl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pct = Math.round((fragancia.ml_actuales / fragancia.ml_original) * 100);
  const nuevosML = parseFloat(ml) || 0;
  const nuevosActuales = Math.min(fragancia.ml_actuales + nuevosML, fragancia.ml_original);
  const nuevoPct = Math.round((nuevosActuales / fragancia.ml_original) * 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ml || nuevosML <= 0) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("fragancias")
      .update({ ml_actuales: nuevosActuales })
      .eq("id", fragancia.id);

    if (error) {
      setError("Error al actualizar. Intenta de nuevo.");
      setLoading(false);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-surface border border-border p-6 space-y-5 sm:m-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-brand-white tracking-wide">Reabastecer</h2>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-white text-xl leading-none transition-colors">×</button>
        </div>

        <div className="space-y-1">
          <p className="font-sans text-sm text-brand-white">{fragancia.nombre}</p>
          <p className="font-sans text-xs text-brand-gray">{fragancia.marca} · {fragancia.ml_actuales.toFixed(0)} ml actuales ({pct}%)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">
              ml a agregar
            </label>
            <input
              type="number" min="1" step="0.5" required
              value={ml} onChange={(e) => setMl(e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
              placeholder="ej. 50"
            />
          </div>

          {ml && nuevosML > 0 && (
            <div className="bg-brand-black/50 border border-border px-3 py-2 space-y-1">
              <p className="font-sans text-xs text-brand-gray">Resultado tras reabastecer:</p>
              <p className="font-sans text-sm text-brand-white tabular-nums">
                {nuevosActuales.toFixed(0)} ml ({nuevoPct}%)
              </p>
            </div>
          )}

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
