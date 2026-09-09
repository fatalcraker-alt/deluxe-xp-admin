"use client";

import type { Fragancia } from "@/types/database";

interface Props {
  fragancia: Fragancia;
  onReabastecer: () => void;
  onEdit: () => void;
}

export default function FraganciaCard({ fragancia, onReabastecer, onEdit }: Props) {
  const pct = Math.round((fragancia.ml_actuales / fragancia.ml_original) * 100);
  const isRed = pct < 15;
  const isYellow = pct >= 15 && pct <= 30;

  const barColor = isRed
    ? "bg-alert-red"
    : isYellow
    ? "bg-alert-yellow"
    : "bg-alert-green";

  const textColor = isRed
    ? "text-alert-red"
    : isYellow
    ? "text-alert-yellow"
    : "text-alert-green";

  return (
    <div className="bg-surface border border-border p-4 space-y-3 hover:border-brand-gray/40 transition-colors">
      {/* Header */}
      <div className="space-y-0.5">
        <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray">{fragancia.marca}</p>
        <h3 className="font-serif text-base text-brand-white leading-tight">{fragancia.nombre}</h3>
        <p className="font-sans text-[10px] text-brand-gray/60">{fragancia.concentracion}</p>
      </div>

      {/* % bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-sans text-[10px] tracking-wider text-brand-gray uppercase">Nivel</span>
          <span className={`font-sans text-xs font-medium tabular-nums ${textColor}`}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-surface-elevated w-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="font-sans text-[10px] text-brand-gray/60 tabular-nums">
            {fragancia.ml_actuales.toFixed(0)} ml restantes
          </span>
          <span className="font-sans text-[10px] text-brand-gray/40 tabular-nums">
            / {fragancia.ml_original} ml
          </span>
        </div>
      </div>

      {/* Precio ml */}
      <div className="flex items-center justify-between pt-1 border-t border-border-subtle">
        <span className="font-sans text-[10px] text-brand-gray uppercase tracking-wider">$/ml</span>
        <span className="font-sans text-xs text-brand-white tabular-nums">
          ${fragancia.precio_ml.toFixed(2)}
        </span>
      </div>

      {/* Alerta */}
      {isRed && (
        <div className="bg-alert-red/10 border border-alert-red/20 px-2 py-1">
          <p className="font-sans text-[10px] text-alert-red tracking-wider uppercase">
            Nivel crítico — reabastecer
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 border border-border text-brand-gray font-sans text-[10px] tracking-widest uppercase py-2 hover:border-brand-white hover:text-brand-white transition-colors"
        >
          Editar
        </button>
        <button
          onClick={onReabastecer}
          className="flex-1 border border-border text-brand-gray font-sans text-[10px] tracking-widest uppercase py-2 hover:border-brand-white hover:text-brand-white transition-colors"
        >
          Reabastecer
        </button>
      </div>
    </div>
  );
}
