import { createClient } from "@/lib/supabase/server";
import VentasList from "@/components/ventas/VentasList";
import type { Venta, Fragancia, Profile } from "@/types/database";

export default async function VentasPage() {
  const supabase = await createClient();

  const [ventasRes, fragRes, profileRes] = await Promise.all([
    supabase
      .from("ventas")
      .select("*, fragancia:fragancias(nombre, marca)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("fragancias").select("id, nombre, marca, precio_ml").eq("activo", true).order("nombre"),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return null;
      return supabase.from("profiles").select("rol").eq("id", user.id).single();
    }),
  ]);

  const rol = (profileRes as any)?.data?.rol ?? "viewer";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-brand-white tracking-wide">Ventas</h1>
        <p className="font-sans text-xs text-brand-gray mt-1 tracking-wider">
          {ventasRes.data?.length ?? 0} registros · últimas 200
        </p>
      </div>
      <VentasList
        initialVentas={(ventasRes.data ?? []) as Venta[]}
        fragancias={(fragRes.data ?? []) as Pick<Fragancia, "id" | "nombre" | "marca" | "precio_ml">[]}
        isAdmin={rol === "admin"}
      />
    </div>
  );
}
