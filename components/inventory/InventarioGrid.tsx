"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import FraganciaCard from "./FraganciaCard";
import AddFraganciaModal from "@/components/modals/AddFraganciaModal";
import ReabastecerModal from "@/components/modals/ReabastecerModal";
import EditFraganciaModal from "@/components/modals/EditFraganciaModal";
import type { Fragancia } from "@/types/database";

type Filter = "todas" | "critico" | "bajo" | "ok";

export default function InventarioGrid({ initialData }: { initialData: Fragancia[] }) {
  const [fragancias, setFragancias] = useState<Fragancia[]>(initialData);
  const [filter, setFilter] = useState<Filter>("todas");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [reabastecerItem, setReabastecerItem] = useState<Fragancia | null>(null);
  const [editItem, setEditItem] = useState<Fragancia | null>(null);
  const supabase = createClient();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("fragancias_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "fragancias" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setFragancias((prev) =>
            prev.map((f) => (f.id === payload.new.id ? (payload.new as Fragancia) : f))
          );
        }
        if (payload.eventType === "INSERT") {
          setFragancias((prev) => [...prev, payload.new as Fragancia].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        }
        if (payload.eventType === "DELETE") {
          setFragancias((prev) => prev.filter((f) => f.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const porcentaje = (f: Fragancia) => Math.round((f.ml_actuales / f.ml_original) * 100);

  const filtered = fragancias.filter((f) => {
    const pct = porcentaje(f);
    const matchFilter =
      filter === "todas" ? true :
      filter === "critico" ? pct < 15 :
      filter === "bajo" ? pct >= 15 && pct <= 30 :
      pct > 30;
    const matchSearch = search === "" ||
      f.nombre.toLowerCase().includes(search.toLowerCase()) ||
      f.marca.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = {
    critico: fragancias.filter((f) => porcentaje(f) < 15).length,
    bajo: fragancias.filter((f) => { const p = porcentaje(f); return p >= 15 && p <= 30; }).length,
    ok: fragancias.filter((f) => porcentaje(f) > 30).length,
  };

  return (
    <div className="space-y-5">
      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "todas",   label: "Todas",                        color: "" },
            { key: "critico", label: `Crítico (${counts.critico})`,  color: "text-alert-red" },
            { key: "bajo",    label: `Bajo (${counts.bajo})`,        color: "text-alert-yellow" },
            { key: "ok",      label: `OK (${counts.ok})`,            color: "text-alert-green" },
          ] as { key: string; label: string; color: string }[]).map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key as Filter)}
              className={`font-sans text-xs tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                filter === key
                  ? "border-brand-white text-brand-white bg-surface-hover"
                  : `border-border ${color ?? "text-brand-gray"} hover:border-brand-gray`
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar fragancia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 sm:w-48 bg-surface border border-border text-brand-white font-sans text-xs px-3 py-1.5 outline-none focus:border-brand-gray transition-colors placeholder:text-brand-gray/40"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-1.5 bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase hover:bg-brand-offwhite transition-colors whitespace-nowrap"
          >
            + Nueva
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-gray font-sans text-xs tracking-wider">
          No hay fragancias con ese filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((f) => (
            <FraganciaCard
              key={f.id}
              fragancia={f}
              onReabastecer={() => setReabastecerItem(f)}
              onEdit={() => setEditItem(f)}
            />
          ))}
        </div>
      )}

      {showAdd && <AddFraganciaModal onClose={() => setShowAdd(false)} />}
      {reabastecerItem && (
        <ReabastecerModal
          fragancia={reabastecerItem}
          onClose={() => setReabastecerItem(null)}
        />
      )}
      {editItem && (
        <EditFraganciaModal
          fragancia={editItem}
          onClose={() => setEditItem(null)}
        />
      )}
    </div>
  );
}
