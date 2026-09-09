"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl tracking-widest uppercase text-brand-white">
            Deluxe XP
          </h1>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-brand-gray">
            Panel de gestión
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block font-sans text-xs tracking-widest uppercase text-brand-gray">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface border border-border text-brand-white font-sans text-sm px-4 py-3 outline-none focus:border-brand-gray transition-colors placeholder:text-brand-gray/40"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-sans text-xs tracking-widest uppercase text-brand-gray">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface border border-border text-brand-white font-sans text-sm px-4 py-3 outline-none focus:border-brand-gray transition-colors placeholder:text-brand-gray/40"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-sans text-xs text-alert-red">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-white text-brand-black font-sans text-xs tracking-widest uppercase py-3 hover:bg-brand-offwhite transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
