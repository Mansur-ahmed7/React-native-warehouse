import { supabase } from "../supabase";
import { StockMovement, StockMovementInsert } from "../../types/database";

export interface StockMovementWithDetails extends StockMovement {
  products?: {
    name: string;
    sku: string;
  } | null;
  warehouses?: {
    name: string;
    location: string | null;
  } | null;
}

export const getMovements = async (): Promise<StockMovementWithDetails[]> => {
  const { data, error } = await supabase
    .from("stock_movements")
    .select(`
      *,
      products:product_id (name, sku),
      warehouses:warehouse_id (name, location)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stock movements:", error);
    throw error;
  }
  return (data as StockMovementWithDetails[]) || [];
};

export const logMovement = async (
  movement: StockMovementInsert
): Promise<StockMovement> => {
  // 1. Fetch current product quantity to ensure consistent calculation
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("quantity, name")
    .eq("id", movement.product_id)
    .single();

  if (productError || !product) {
    console.error("Failed to fetch product for movement:", productError);
    throw new Error("Product not found");
  }

  // 2. Calculate new stock level based on IN/OUT type
  let newQuantity = product.quantity;
  if (movement.type === "IN") {
    newQuantity += movement.quantity;
  } else if (movement.type === "OUT") {
    if (product.quantity < movement.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${movement.quantity}`
      );
    }
    newQuantity -= movement.quantity;
  }

  // 3. Log the movement
  const { data: loggedMovement, error: movementError } = await supabase
    .from("stock_movements")
    .insert(movement)
    .select("*")
    .single();

  if (movementError) {
    console.error("Error inserting stock movement record:", movementError);
    throw movementError;
  }

  // 4. Update the product's current stock level
  const { error: updateError } = await supabase
    .from("products")
    .update({ quantity: newQuantity })
    .eq("id", movement.product_id);

  if (updateError) {
    console.error("Error updating product quantity after movement:", updateError);
    // Note: In production, consider database triggers or edge functions for atomicity.
    throw updateError;
  }

  return loggedMovement;
};
