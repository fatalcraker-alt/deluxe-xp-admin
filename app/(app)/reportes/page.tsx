import { createClient } from "@/lib/supabase/server";
import ReportesClient from "@/components/reportes/ReportesClient";
import type { Venta, Gasto, Fragancia } from "@/types/database";

export default async function ReportesPage() {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];

  const [ventasRes, gastosRes, fragRes] = await Promise.all([
    supabase.from("ventas").select("*, fragancia:fragancias(nombre, marca)").gte("fecha", monthStart).order("fecha"),
    supabase.from("gastos").select("*").gte("fecha", monthStart).order("fecha"),
    supabase.from("fragancias").select("id, nombre, marca").eq("activo", true).order("nombre"),
  ]);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-brand-white tracking-wide">Reportes</h1>
        <p className="font-sans text-xs text-brand-gray mt-1 tracking-wider">
          Resumen moldeable con filtros
        </p>
      </div>
      <ReportesClient
        initialVentas={(ventasRes.data ?? []) as Venta[]}
        initialGastos={(gastosRes.data ?? []) as Gasto[]}
        fragancias={(fragRes.data ?? []) as Pick<Fragancia, "id" | "nombre" | "marca">[]}
        defaultMonthStart={monthStart}
      />
    </div>
  );
}
