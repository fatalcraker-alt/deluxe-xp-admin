"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AddVentaModal from "@/components/modals/AddVentaModal";
import type { Venta, Fragancia } from "@/types/database";

const CANAL_LABELS: Record<string, string> = { whatsapp: "WhatsApp", presencial: "Presencial", otro: "Otro" };
const TIPO_LABELS: Record<string, string> = { "5ml": "5 ml", "10ml": "10 ml", completo: "Completo", promo: "Promo" };

interface Props {
  initialVentas: Venta[];
  fragancias: Pick<Fragancia, "id" | "nombre" | "marca" | "precio_ml">[];
  isAdmin: boolean;
}

export default function VentasList({ initialVentas, fragancias, isAdmin }: Props) {
  const [ventas, setVentas] = useState<Venta[]>(initialVentas);
  const [showAdd, setShowAdd] = useState(false);
  const [filterCanal, setFilterCanal] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterFecha, setFilterFecha] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("ventas_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ventas" }, async (payload) => {
        const { data } = await supabase
          .from("ventas")
          .select("*, fragancia:fragancias(nombre, marca)")
          .eq("id", payload.new.id)
          .single();
        if (data) setVentas((prev) => [data as Venta, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const filtered = ventas.filter((v) => {
    const matchCanal = filterCanal === "todos" || v.canal === filterCanal;
    const matchTipo = filterTipo === "todos" || v.tipo === filterTipo;
    const matchFecha = !filterFecha || v.fecha === filterFecha;
    return matchCanal && matchTipo && matchFecha;
  });

  const totalFiltrado = filtered.reduce((sum, v) => sum + (v.total ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          {/* Canal filter */}
          <select value={filterCanal} onChange={(e) => setFilterCanal(e.target.value)}
            className="bg-surface border border-border text-brand-white font-sans text-xs px-3 py-1.5 outline-none focus:border-brand-gray">
            <option value="todos">Todos los canales</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="presencial">Presencial</option>
            <option value="otro">Otro</option>
          </select>
          {/* Tipo filter */}
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}
            className="bg-surface border border-border text-brand-white font-sans text-xs px-3 py-1.5 outline-none focus:border-brand-gray">
            <option value="todos">Todos los tipos</option>
            <option value="5ml">5 ml</option>
            <option value="10ml">10 ml</option>
            <option value="completo">Completo</option>
            <option value="promo">Promo</option>
          </select>
          {/* Fecha filter */}
          <input type="date" value={filterFecha} onChange={(e) => setFilterFecha(e.target.value)}
            className="bg-surface border border-border text-brand-white font-sans text-xs px-3 py-1.5 outline-none focus:border-brand-gray" />
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)}
            className="px-4 py-1.5 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase hover:bg-brand-offwhite transition-colors whitespace-nowrap">
            + Nueva Venta
          </button>
        )}
      </div>

      {/* Total */}
      {filtered.length > 0 && (
        <div className="bg-surface border border-border px-4 py-3 flex items-center justify-between">
          <span className="font-sans text-xs text-brand-gray uppercase tracking-wider">
            Total ({filtered.length} ventas)
          </span>
          <span className="font-serif text-xl text-brand-white">${totalFiltrado.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Fecha", "Fragancia", "Tipo", "Cant.", "Precio u.", "Total", "Canal", "Nota"].map((h) => (
                <th key={h} className="text-left font-sans text-[10px] tracking-widest uppercase text-brand-gray pb-2 pr-4 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 font-sans text-xs text-brand-gray">
                  Sin registros con ese filtro.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="hover:bg-surface-hover transition-colors">
                  <td className="py-2.5 pr-4 font-sans text-xs text-brand-gray whitespace-nowrap tabular-nums">{v.fecha}</td>
                  <td className="py-2.5 pr-4 font-sans text-xs text-brand-white">
                    {v.fragancia ? (
                      <span>{v.fragancia.nombre} <span className="text-brand-gray">· {v.fragancia.marca}</span></span>
                    ) : (
                      <span className="text-brand-gray italic">—</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="font-sans text-[10px] tracking-widest uppercase text-brand-gray border border-border px-1.5 py-0.5">
                      {TIPO_LABELS[v.tipo] ?? v.tipo}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-sans text-xs text-brand-white tabular-nums">{v.cantidad}</td>
                  <td className="py-2.5 pr-4 font-sans text-xs text-brand-white tabular-nums">${v.precio_unitario.toFixed(2)}</td>
                  <td className="py-2.5 pr-4 font-sans text-sm text-brand-white font-medium tabular-nums">
                    ${(v.total ?? 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 pr-4 font-sans text-xs text-brand-gray">{CANAL_LABELS[v.canal] ?? v.canal}</td>
                  <td className="py-2.5 font-sans text-xs text-brand-gray/60 max-w-[120px] truncate">{v.notas ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <AddVentaModal fragancias={fragancias} onClose={() => setShowAdd(false)} />
      )}
    </div>
  );
}
