export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          sku: string;
          category: string | null;
          quantity: number;
          unit: string;
          min_stock: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sku: string;
          category?: string | null;
          quantity?: number;
          unit?: string;
          min_stock?: number;
          price?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sku?: string;
          category?: string | null;
          quantity?: number;
          unit?: string;
          min_stock?: number;
          price?: number;
          created_at?: string;
        };
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string | null;
          created_at?: string;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          product_id: string;
          warehouse_id: string;
          type: "IN" | "OUT";
          quantity: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          warehouse_id: string;
          type: "IN" | "OUT";
          quantity: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          warehouse_id?: string;
          type?: "IN" | "OUT";
          quantity?: number;
          note?: string | null;
          created_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Convenient individual table row typings
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type Warehouse = Database["public"]["Tables"]["warehouses"]["Row"];
export type WarehouseInsert = Database["public"]["Tables"]["warehouses"]["Insert"];
export type WarehouseUpdate = Database["public"]["Tables"]["warehouses"]["Update"];

export type StockMovement = Database["public"]["Tables"]["stock_movements"]["Row"];
export type StockMovementInsert = Database["public"]["Tables"]["stock_movements"]["Insert"];
export type StockMovementUpdate = Database["public"]["Tables"]["stock_movements"]["Update"];

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type SupplierInsert = Database["public"]["Tables"]["suppliers"]["Insert"];
export type SupplierUpdate = Database["public"]["Tables"]["suppliers"]["Update"];
