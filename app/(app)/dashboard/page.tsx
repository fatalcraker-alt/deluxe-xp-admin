import { createClient } from "@/lib/supabase/server";
import DashboardClient from "@/components/dashboard/DashboardClient";
import type { Fragancia, Venta, Gasto } from "@/types/database";

function getDateRange() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    today,
    weekStart: startOfWeek.toISOString().split("T")[0],
    monthStart: startOfMonth.toISOString().split("T")[0],
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { today, weekStart, monthStart } = getDateRange();

  const [ventasRes, gastosRes, fragRes, profileRes] = await Promise.all([
    supabase.from("ventas").select("*, fragancia:fragancias(nombre, marca)").gte("fecha", monthStart).order("fecha"),
    supabase.from("gastos").select("*").gte("fecha", monthStart),
    supabase.from("fragancias").select("*").eq("activo", true).order("ml_actuales"),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return { data: { nombre: "—", rol: "admin" } };
      const { data } = await supabase.from("profiles").select("nombre, rol").eq("id", user.id).single();
      return { data };
    }),
  ]);

  const ventas = (ventasRes.data ?? []) as Venta[];
  const gastos = (gastosRes.data ?? []) as Gasto[];
  const fragancias = (fragRes.data ?? []) as Fragancia[];
  const profile = (profileRes as any).data;

  // Métricas calculadas server-side
  const ventasHoy = ventas.filter((v) => v.fecha === today);
  const ventasSemana = ventas.filter((v) => v.fecha >= weekStart);

  const ingresosMes = ventas.reduce((sum, v) => sum + (v.total ?? 0), 0);
  const ingresosHoy = ventasHoy.reduce((sum, v) => sum + (v.total ?? 0), 0);
  const ingresosSemana = ventasSemana.reduce((sum, v) => sum + (v.total ?? 0), 0);
  const gastosMes = gastos.reduce((sum, g) => sum + g.monto, 0);
  const margenMes = ingresosMes - gastosMes;

  // Top 5 fragancias por total vendido
  const fragranciaMap: Record<string, { nombre: string; total: number; unidades: number }> = {};
  ventas.forEach((v) => {
    if (v.fragancia_id && v.fragancia) {
      const key = v.fragancia_id;
      if (!fragranciaMap[key]) {
        fragranciaMap[key] = { nombre: (v.fragancia as any).nombre, total: 0, unidades: 0 };
      }
      fragranciaMap[key].total += v.total ?? 0;
      fragranciaMap[key].unidades += v.cantidad;
    }
  });
  const topFragancias = Object.values(fragranciaMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Alertas inventario
  const alertasInventario = fragancias.filter(
    (f) => (f.ml_actuales / f.ml_original) * 100 < 15
  );

  // Ventas por día (para gráfica)
  const ventasPorDia: Record<string, number> = {};
  ventas.forEach((v) => {
    ventasPorDia[v.fecha] = (ventasPorDia[v.fecha] ?? 0) + (v.total ?? 0);
  });
  const chartData = Object.entries(ventasPorDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, total]) => ({ fecha: fecha.slice(5), total })); // MM-DD format

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-brand-white tracking-wide">
          Dashboard
        </h1>
        <p className="font-sans text-xs text-brand-gray mt-1 tracking-wider">
          Bienvenido, {profile?.nombre} · Datos del mes actual
        </p>
      </div>

      <DashboardClient
        ingresosHoy={ingresosHoy}
        ingresosSemana={ingresosSemana}
        ingresosMes={ingresosMes}
        gastosMes={gastosMes}
        margenMes={margenMes}
        ventasHoyCount={ventasHoy.length}
        topFragancias={topFragancias}
        alertasInventario={alertasInventario as Fragancia[]}
        chartData={chartData}
      />
    </div>
  );
}
