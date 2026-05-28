import { createClient } from "@/lib/supabase/server";
import InventarioGrid from "@/components/inventory/InventarioGrid";
import type { Fragancia } from "@/types/database";

export default async function InventarioPage() {
  const supabase = await createClient();
  const { data: fragancias } = await supabase
    .from("fragancias")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-brand-white tracking-wide">Inventario</h1>
          <p className="font-sans text-xs text-brand-gray mt-1 tracking-wider">
            {fragancias?.length ?? 0} fragancias · actualización en tiempo real
          </p>
        </div>
      </div>
      <InventarioGrid initialData={(fragancias ?? []) as Fragancia[]} />
    </div>
  );
}
