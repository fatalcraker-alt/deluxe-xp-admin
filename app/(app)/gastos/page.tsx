import { createClient } from "@/lib/supabase/server";
import GastosClient from "@/components/gastos/GastosClient";
import type { Gasto } from "@/types/database";

export default async function GastosPage() {
  const supabase = await createClient();

  const [gastosRes, profileRes] = await Promise.all([
    supabase.from("gastos").select("*").order("fecha", { ascending: false }).order("created_at", { ascending: false }).limit(200),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return null;
      return supabase.from("profiles").select("rol").eq("id", user.id).single();
    }),
  ]);

  const rol = (profileRes as any)?.data?.rol ?? "viewer";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-brand-white tracking-wide">Gastos</h1>
        <p className="font-sans text-xs text-brand-gray mt-1 tracking-wider">
          {gastosRes.data?.length ?? 0} registros
        </p>
      </div>
      <GastosClient initialGastos={(gastosRes.data ?? []) as Gasto[]} isAdmin={rol === "admin"} />
    </div>
  );
}
