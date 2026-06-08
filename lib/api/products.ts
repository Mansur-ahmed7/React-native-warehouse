import { supabase } from "../supabase";
import { Product, ProductInsert, ProductUpdate } from "../../types/database";

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
  return data || [];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
  return data;
};

export const createProduct = async (product: ProductInsert): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select("*")
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw error;
  }
  return data;
};

export const updateProduct = async (
  id: string,
  updates: ProductUpdate
): Promise<Product> => {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
  return data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};
