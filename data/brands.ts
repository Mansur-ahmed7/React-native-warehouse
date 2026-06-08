import { useWarehouseStore } from "../store/useWarehouseStore";

export function useCarBrands() {
  return useWarehouseStore((s) => s.carBrands);
}
