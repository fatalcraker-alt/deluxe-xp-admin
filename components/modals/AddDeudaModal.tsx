"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DeudaPepillo, TipoDeuda } from "@/types/database";

interface Props {
  onClose: () => void;
  onAdded: (deuda: DeudaPepillo) => void;
}

const TIPOS: { value: TipoDeuda; label: string; icon: string }[] = [
  { value: "tarjeta_credito", label: "Tarjeta de crédito", icon: "💳" },
  { value: "prestamo_meses", label: "Préstamo a meses", icon: "📅" },
  { value: "dinero_extra", label: "Dinero extra", icon: "💵" },
  { value: "apuestas", label: "Apuestas", icon: "🎰" },
  { value: "otro", label: "Otro", icon: "📌" },
];

const TIENE_FECHA_LIMITE = ["tarjeta_credito", "prestamo_meses"];

export default function AddDeudaModal({ onClose, onAdded }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    tipo: "tarjeta_credito" as TipoDeuda,
    monto: "",
    descripcion: "",
    fecha_limite: "",
    fecha_realizacion: new Date().toISOString().slice(0, 10),
  });

  const set = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));
  const tieneFechaLimite = TIENE_FECHA_LIMITE.includes(form.tipo);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.monto || isNaN(parseFloat(form.monto))) {
      setError("Ingresa un monto válido.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
      tipo: form.tipo,
      monto: parseFloat(form.monto),
      descripcion: form.descripcion.trim() || null,
      fecha_limite: tieneFechaLimite ? (form.fecha_limite || null) : null,
      fecha_realizacion: !tieneFechaLimite ? (form.fecha_realizacion || null) : null,
    };

    const { data, error: err } = await supabase
      .from("deudas_pepillo")
      .insert(payload)
      .select()
      .single();

    if (err || !data) {
      setError("Error al guardar. Intenta de nuevo.");
      setLoading(false);
    } else {
      onAdded(data as DeudaPepillo);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-brand-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-sm bg-surface border border-border p-6 space-y-5 sm:m-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-brand-white tracking-wide">Registrar deuda</h2>
          <button onClick={onClose} className="text-brand-gray hover:text-brand-white text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Tipo</label>
            <div className="grid grid-cols-2 gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("tipo", t.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 border text-left transition-colors font-sans text-xs ${
                    form.tipo === t.value
                      ? "border-brand-white text-brand-white bg-surface-hover"
                      : "border-border text-brand-gray hover:border-brand-gray"
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Monto */}
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">Monto (MXN)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.monto}
              onChange={(e) => set("monto", e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
              placeholder="0.00"
            />
          </div>

          {/* Fecha límite o fecha realización */}
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">
              {tieneFechaLimite ? "Fecha límite de pago" : "Fecha de realización"}
            </label>
            <input
              type="date"
              value={tieneFechaLimite ? form.fecha_limite : form.fecha_realizacion}
              onChange={(e) =>
                set(tieneFechaLimite ? "fecha_limite" : "fecha_realizacion", e.target.value)
              }
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="block font-sans text-[10px] tracking-widest uppercase text-brand-gray">
              Descripción <span className="normal-case">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              className="w-full bg-brand-black border border-border text-brand-white font-sans text-sm px-3 py-2 outline-none focus:border-brand-gray transition-colors"
              placeholder="Ej. Cena del viernes, Uber al aeropuerto..."
            />
          </div>

          {error && <p className="font-sans text-xs text-alert-red">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border text-brand-gray font-sans text-xs tracking-widest uppercase py-2.5 hover:border-brand-white hover:text-brand-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase py-2.5 hover:bg-brand-offwhite transition-colors disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
