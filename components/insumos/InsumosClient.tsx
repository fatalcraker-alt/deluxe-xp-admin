"use client";

import { useState } from "react";
import AddInsumoModal from "@/components/modals/AddInsumoModal";
import AjustarInsumoModal from "@/components/modals/AjustarInsumoModal";
import type { Insumo, CategoriaInsumo } from "@/types/database";

const CAT_LABELS: Record<CategoriaInsumo, string> = {
  frasco_5ml: "Frasco 5 ml",
  frasco_10ml: "Frasco 10 ml",
  atomizador: "Atomizador",
  etiqueta: "Etiqueta",
  packaging: "Packaging",
  otro: "Otro",
};

interface Props {
  initialInsumos: Insumo[];
  isAdmin: boolean;
}

export default function InsumosClient({ initialInsumos, isAdmin }: Props) {
  const [insumos, setInsumos] = useState<Insumo[]>(initialInsumos);
  const [showAdd, setShowAdd] = useState(false);
  const [ajustar, setAjustar] = useState<Insumo | null>(null);

  const criticos = insumos.filter((i) => i.cantidad <= i.stock_minimo);

  function onAdded(insumo: Insumo) {
    setInsumos((prev) => [...prev, insumo].sort((a, b) => a.nombre.localeCompare(b.nombre)));
    setShowAdd(false);
  }

  function onAjustado(updated: Insumo) {
    setInsumos((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setAjustar(null);
  }

  return (
    <div className="space-y-5">
      {/* Alertas */}
      {criticos.length > 0 && (
        <div className="bg-alert-yellow/10 border border-alert-yellow/30 px-4 py-3">
          <p className="font-sans text-xs text-alert-yellow tracking-wider uppercase">
            {criticos.length} insumo{criticos.length > 1 ? "s" : ""} por debajo del stock mínimo:{" "}
            {criticos.map((i) => i.nombre).join(", ")}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="font-sans text-xs text-brand-gray tracking-wider">{insumos.length} insumos registrados</p>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-1.5 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase hover:bg-brand-offwhite transition-colors">
            + Nuevo Insumo
          </button>
        )}
      </div>

      {/* Grid */}
      {insumos.length === 0 ? (
        <div className="text-center py-16 text-brand-gray font-sans text-xs tracking-wider">
          Sin insumos registrados aún.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {insumos.map((insumo) => {
            const isCritico = insumo.cantidad <= insumo.stock_minimo;
            return (
              <div key={insumo.id} className={`bg-surface border p-4 space-y-3 transition-colors ${
                isCritico ? "border-alert-yellow/40" : "border-border hover:border-brand-gray/40"
              }`}>
                <div className="space-y-0.5">
                  <p className="font-sans text-[10px] tracking-widest uppercase text-brand-gray">
                    {CAT_LABELS[insumo.categoria as CategoriaInsumo]}
                  </p>
                  <h3 className="font-serif text-base text-brand-white">{insumo.nombre}</h3>
                </div>
                <div className="flex items-end justify-between pt-1 border-t border-border-subtle">
                  <div>
                    <p className={`font-sans text-2xl font-medium tabular-nums ${isCritico ? "text-alert-yellow" : "text-brand-white"}`}>
                      {insumo.cantidad}
                    </p>
                    <p className="font-sans text-[10px] text-brand-gray">{insumo.unidad} · mín. {insumo.stock_minimo}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => setAjustar(insumo)}
                      className="font-sans text-[10px] tracking-widest uppercase text-brand-gray border border-border px-2 py-1 hover:border-brand-white hover:text-brand-white transition-colors">
                      Ajustar
                    </button>
                  )}
                </div>
                {isCritico && (
                  <div className="bg-alert-yellow/10 border border-alert-yellow/20 px-2 py-1">
                    <p className="font-sans text-[10px] text-alert-yellow tracking-wider uppercase">Stock bajo</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAdd && <AddInsumoModal onClose={() => setShowAdd(false)} onAdded={onAdded} />}
      {ajustar && <AjustarInsumoModal insumo={ajustar} onClose={() => setAjustar(null)} onAjustado={onAjustado} />}
    </div>
  );
}
