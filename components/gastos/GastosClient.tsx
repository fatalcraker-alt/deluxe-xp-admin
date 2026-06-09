"use client";

import { useState } from "react";
import AddGastoModal from "@/components/modals/AddGastoModal";
import EditGastoModal from "@/components/modals/EditGastoModal";
import type { Gasto, CategoriaGasto } from "@/types/database";

const CAT_LABELS: Record<CategoriaGasto, string> = {
  insumos: "Insumos",
  envio: "Envío",
  publicidad: "Publicidad",
  reposicion: "Reposición",
  otro: "Otro",
};

interface Props {
  initialGastos: Gasto[];
  isAdmin: boolean;
}

export default function GastosClient({ initialGastos, isAdmin }: Props) {
  const [gastos, setGastos] = useState<Gasto[]>(initialGastos);
  const [showAdd, setShowAdd] = useState(false);
  const [editGasto, setEditGasto] = useState<Gasto | null>(null);
  const [filterCat, setFilterCat] = useState("todas");
  const [filterFecha, setFilterFecha] = useState("");

  const filtered = gastos.filter((g) => {
    const matchCat = filterCat === "todas" || g.categoria === filterCat;
    const matchFecha = !filterFecha || g.fecha === filterFecha;
    return matchCat && matchFecha;
  });

  const total = filtered.reduce((sum, g) => sum + g.monto, 0);

  function onAdded(gasto: Gasto) {
    setGastos((prev) => [gasto, ...prev]);
    setShowAdd(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="bg-surface border border-border text-brand-white font-sans text-xs px-3 py-1.5 outline-none focus:border-brand-gray">
            <option value="todas">Todas las categorías</option>
            {Object.entries(CAT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <input type="date" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)}
            className="bg-surface border border-border text-brand-white font-sans text-xs px-3 py-1.5 outline-none focus:border-brand-gray" />
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-1.5 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase hover:bg-brand-offwhite transition-colors whitespace-nowrap">
            + Nuevo Gasto
          </button>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="bg-surface border border-border px-4 py-3 flex items-center justify-between">
          <span className="font-sans text-xs text-brand-gray uppercase tracking-wider">
            Total ({filtered.length} gastos)
          </span>
          <span className="font-serif text-xl text-alert-red">
            -${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Fecha", "Categoría", "Descripción", "Monto", ""].map((h) => (
                <th key={h} className="text-left font-sans text-[10px] tracking-widest uppercase text-brand-gray pb-2 pr-4 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 font-sans text-xs text-brand-gray">Sin gastos registrados.</td></tr>
            ) : (
              filtered.map((g) => (
                <tr key={g.id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-2.5 pr-4 font-sans text-xs text-brand-gray whitespace-nowrap tabular-nums">{g.fecha}</td>
                  <td className="py-2.5 pr-4">
                    <span className="font-sans text-[10px] tracking-widest uppercase text-brand-gray border border-border px-1.5 py-0.5">
                      {CAT_LABELS[g.categoria as CategoriaGasto]}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-sans text-xs text-brand-white">{g.descripcion}</td>
                  <td className="py-2.5 pr-4 font-sans text-sm text-alert-red font-medium tabular-nums">
                    -${g.monto.toFixed(2)}
                  </td>
                  <td className="py-2.5">
                    {isAdmin && (
                      <button
                        onClick={() => setEditGasto(g)}
                        className="font-sans text-[10px] tracking-widest uppercase text-brand-gray hover:text-brand-white border border-border hover:border-brand-gray px-2 py-0.5 transition-colors whitespace-nowrap"
                      >
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && <AddGastoModal onClose={() => setShowAdd(false)} onAdded={onAdded} />}
      {editGasto && (
        <EditGastoModal
          gasto={editGasto}
          onClose={() => setEditGasto(null)}
          onSaved={(updated) => {
            setGastos((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
            setEditGasto(null);
          }}
        />
      )}
    </div>
  );
}
