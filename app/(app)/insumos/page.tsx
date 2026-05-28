import { createClient } from "@/lib/supabase/server";
import InsumosClient from "@/components/insumos/InsumosClient";
import type { Insumo } from "@/types/database";

export default async function InsumosPage() {
  const supabase = await createClient();

  const [insumosRes, profileRes] = await Promise.all([
    supabase.from("insumos").select("*").order("nombre"),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return null;
      return supabase.from("profiles").select("rol").eq("id", user.id).single();
    }),
  ]);

  const rol = (profileRes as any)?.data?.rol ?? "viewer";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-brand-white tracking-wide">Insumos</h1>
        <p className="font-sans text-xs text-brand-gray mt-1 tracking-wider">
          Stock de materiales y empaques
        </p>
      </div>
      <InsumosClient initialInsumos={(insumosRes.data ?? []) as Insumo[]} isAdmin={rol === "admin"} />
    </div>
  );
}
