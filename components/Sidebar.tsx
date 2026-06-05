"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/inventario", label: "Inventario", icon: "◈" },
  { href: "/ventas", label: "Ventas", icon: "◎" },
  { href: "/gastos", label: "Gastos", icon: "◇" },
  { href: "/pepillo", label: "Pepillo", icon: "◉" },
  { href: "/reportes", label: "Reportes", icon: "◫" },
];

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-surface border-r border-border fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-border">
          <p className="font-serif text-lg tracking-widest uppercase text-brand-white">Deluxe XP</p>
          <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-brand-gray mt-0.5">Admin</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 font-sans text-xs tracking-wider uppercase transition-colors ${
                  active
                    ? "bg-surface-hover text-brand-white"
                    : "text-brand-gray hover:text-brand-white hover:bg-surface-hover"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-3 pb-6 border-t border-border pt-4 space-y-3">
          <div className="px-3">
            <p className="font-sans text-xs text-brand-white truncate">{profile.nombre}</p>
            <p className="font-sans text-[10px] text-brand-gray uppercase tracking-wider mt-0.5">{profile.rol}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 font-sans text-xs tracking-wider uppercase text-brand-gray hover:text-brand-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border flex">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 font-sans text-[9px] tracking-wider uppercase transition-colors ${
                active ? "text-brand-white" : "text-brand-gray"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
