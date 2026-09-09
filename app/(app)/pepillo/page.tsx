import { createClient } from "@/lib/supabase/server";
import PepilloClient from "@/components/pepillo/PepilloClient";
import type { DeudaPepillo } from "@/types/database";

export default async function PepilloPage() {
  const supabase = await createClient();

  const [deudasRes, profileRes] = await Promise.all([
    supabase
      .from("deudas_pepillo")
      .select("*")
      .order("created_at", { ascending: true }),
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return null;
      return supabase.from("profiles").select("rol").eq("id", user.id).single();
    }),
  ]);

  const rol = (profileRes as any)?.data?.rol ?? "viewer";

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-brand-white tracking-wide">
          Deudas · Pepillo
        </h1>
        <p className="font-sans text-xs text-brand-gray mt-1 tracking-wider">
          Seguimiento de lo que Pepillo debe
        </p>
      </div>
      <PepilloClient
        initialDeudas={(deudasRes.data ?? []) as DeudaPepillo[]}
        isAdmin={rol === "admin"}
      />
    </div>
  );
}
