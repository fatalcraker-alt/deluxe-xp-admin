export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      fragancias: {
        Row: {
          activo: boolean
          concentracion: string
          costo_adquisicion: number
          created_at: string
          id: string
          marca: string
          ml_actuales: number
          ml_original: number
          nombre: string
          precio_ml: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          concentracion?: string
          costo_adquisicion?: number
          created_at?: string
          id?: string
          marca: string
          ml_actuales: number
          ml_original: number
          nombre: string
          precio_ml?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          concentracion?: string
          costo_adquisicion?: number
          created_at?: string
          id?: string
          marca?: string
          ml_actuales?: number
          ml_original?: number
          nombre?: string
          precio_ml?: number
          updated_at?: string
        }
        Relationships: []
      }
      gastos: {
        Row: {
          categoria: string
          created_at: string
          created_by: string | null
          descripcion: string
          fecha: string
          id: string
          monto: number
        }
        Insert: {
          categoria: string
          created_at?: string
          created_by?: string | null
          descripcion: string
          fecha?: string
          id?: string
          monto: number
        }
        Update: {
          categoria?: string
          created_at?: string
          created_by?: string | null
          descripcion?: string
          fecha?: string
          id?: string
          monto?: number
        }
        Relationships: [
          {
            foreignKeyName: "gastos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insumos: {
        Row: {
          cantidad: number
          categoria: string
          costo_unitario: number
          created_at: string
          id: string
          nombre: string
          stock_minimo: number
          unidad: string
          updated_at: string
        }
        Insert: {
          cantidad?: number
          categoria: string
          costo_unitario?: number
          created_at?: string
          id?: string
          nombre: string
          stock_minimo?: number
          unidad?: string
          updated_at?: string
        }
        Update: {
          cantidad?: number
          categoria?: string
          costo_unitario?: number
          created_at?: string
          id?: string
          nombre?: string
          stock_minimo?: number
          unidad?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nombre: string
          rol: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nombre: string
          rol?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nombre?: string
          rol?: string
        }
        Relationships: []
      }
      ventas: {
        Row: {
          canal: string
          cantidad: number
          created_at: string
          created_by: string | null
          fecha: string
          fragancia_id: string | null
          id: string
          notas: string | null
          precio_unitario: number
          tipo: string
          total: number | null
        }
        Insert: {
          canal?: string
          cantidad?: number
          created_at?: string
          created_by?: string | null
          fecha?: string
          fragancia_id?: string | null
          id?: string
          notas?: string | null
          precio_unitario: number
          tipo: string
          total?: number | null
        }
        Update: {
          canal?: string
          cantidad?: number
          created_at?: string
          created_by?: string | null
          fecha?: string
          fragancia_id?: string | null
          id?: string
          notas?: string | null
          precio_unitario?: number
          tipo?: string
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ventas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ventas_fragancia_id_fkey"
            columns: ["fragancia_id"]
            isOneToOne: false
            referencedRelation: "fragancias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── Helper type aliases ───────────────────────────────────────────────────────

export type Fragancia = Database["public"]["Tables"]["fragancias"]["Row"]
export type FraganciaInsert = Database["public"]["Tables"]["fragancias"]["Insert"]

export type Venta = Database["public"]["Tables"]["ventas"]["Row"] & {
  fragancia?: Pick<Fragancia, "nombre" | "marca"> | null
}
export type VentaInsert = Database["public"]["Tables"]["ventas"]["Insert"]

export type Gasto = Database["public"]["Tables"]["gastos"]["Row"]
export type GastoInsert = Database["public"]["Tables"]["gastos"]["Insert"]

export type Insumo = Database["public"]["Tables"]["insumos"]["Row"]
export type InsumoInsert = Database["public"]["Tables"]["insumos"]["Insert"]

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

// ─── String union helpers (for selects / labels) ──────────────────────────────

export type Rol = "admin" | "viewer"
export type TipoVenta = "5ml" | "10ml" | "completo" | "promo"
export type CanalVenta = "whatsapp" | "presencial" | "otro"
export type CategoriaGasto = "insumos" | "envio" | "publicidad" | "reposicion" | "otro"
export type CategoriaInsumo = "frasco_5ml" | "frasco_10ml" | "atomizador" | "etiqueta" | "packaging" | "otro"
