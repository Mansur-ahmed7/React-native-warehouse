import { supabase } from "../supabase";
import { Warehouse, WarehouseInsert, WarehouseUpdate } from "../../types/database";

export const getWarehouses = async (): Promise<Warehouse[]> => {
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching warehouses:", error);
    throw error;
  }
  return data || [];
};

export const getWarehouseById = async (id: string): Promise<Warehouse | null> => {
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching warehouse ${id}:`, error);
    throw error;
  }
  return data;
};

export const createWarehouse = async (
  warehouse: WarehouseInsert
): Promise<Warehouse> => {
  const { data, error } = await supabase
    .from("warehouses")
    .insert(warehouse)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating warehouse:", error);
    throw error;
  }
  return data;
};

export const updateWarehouse = async (
  id: string,
  updates: WarehouseUpdate
): Promise<Warehouse> => {
  const { data, error } = await supabase
    .from("warehouses")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(`Error updating warehouse ${id}:`, error);
    throw error;
  }
  return data;
};

export const deleteWarehouse = async (id: string): Promise<void> => {
  const { error } = await supabase.from("warehouses").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting warehouse ${id}:`, error);
    throw error;
  }
};
