import { useWarehouseStore } from "../useWarehouseStore";
import { Part } from "../../types/inventory";

describe("useWarehouseStore QA Validation & Edge Case Unit Tests", () => {
  beforeEach(() => {
    // Reset state before each test
    useWarehouseStore.getState().clearCart();
    useWarehouseStore.getState().setExchangeRate(1310);
  });

  // Edge Case 1: Empty Fields Validation
  it("should prevent adding a part with an empty name or part number", () => {
    const emptyNamePart: Part = {
      id: "part-test-empty-name",
      name: "   ", // Empty string after trimming
      nameKu: "سێتی پد بڕێک",
      partNumber: "PN-EMPTY-1",
      condition: "new",
      supplier: "Ahmad Auto",
      buyPriceUSD: 10,
      sellPriceIQD: 15000,
      quantity: 5,
      lowStockThreshold: 2,
      compatibleCars: [],
      status: "inStock",
    };

    const emptyPartNum: Part = {
      id: "part-test-empty-pn",
      name: "Brake Hose",
      nameKu: "سێتی پد بڕێک",
      partNumber: "", // Empty part number
      condition: "new",
      supplier: "Ahmad Auto",
      buyPriceUSD: 10,
      sellPriceIQD: 15000,
      quantity: 5,
      lowStockThreshold: 2,
      compatibleCars: [],
      status: "inStock",
    };

    const addedEmptyName = useWarehouseStore.getState().addPart(emptyNamePart);
    const addedEmptyPn = useWarehouseStore.getState().addPart(emptyPartNum);

    expect(addedEmptyName).toBe(false);
    expect(addedEmptyPn).toBe(false);
  });

  // Edge Case 2: Negative Number Boundaries
  it("should prevent adding parts with negative quantities, thresholds, or prices", () => {
    const invalidPart: Part = {
      id: "part-test-negative",
      name: "Engine Filter Valve",
      nameKu: "فلتەری نەوت",
      partNumber: "PN-NEG-1",
      condition: "new",
      supplier: "Ahmad Auto",
      buyPriceUSD: -5.00, // Negative Price
      sellPriceIQD: 12000,
      quantity: -1, // Negative Quantity
      lowStockThreshold: -3, // Negative Threshold
      compatibleCars: [],
      status: "inStock",
    };

    const success = useWarehouseStore.getState().addPart(invalidPart);
    expect(success).toBe(false);
  });

  // Edge Case 3: Duplicate Part Number Interception
  it("should prevent duplicate part numbers to avoid barcode scanning collision issues", () => {
    const initialPartsCount = useWarehouseStore.getState().parts.length;
    
    const part1: Part = {
      id: "dup-1",
      name: "Coil Wire A",
      nameKu: "شەمەی مۆتۆر",
      partNumber: "COIL-UNIQUE-9",
      condition: "new",
      supplier: "Ahmad Auto",
      buyPriceUSD: 12.50,
      sellPriceIQD: 20000,
      quantity: 10,
      lowStockThreshold: 3,
      compatibleCars: [],
      status: "inStock",
    };

    const part2: Part = {
      id: "dup-2",
      name: "Coil Wire B",
      nameKu: "شەمەی مۆتۆر",
      partNumber: "COIL-UNIQUE-9", // Duplicate part number
      condition: "used",
      supplier: "Ahmad Auto",
      buyPriceUSD: 8.00,
      sellPriceIQD: 15000,
      quantity: 5,
      lowStockThreshold: 2,
      compatibleCars: [],
      status: "inStock",
    };

    const addedFirst = useWarehouseStore.getState().addPart(part1);
    const addedSecond = useWarehouseStore.getState().addPart(part2);

    expect(addedFirst).toBe(true);
    expect(addedSecond).toBe(false); // Second part should fail validation
    expect(useWarehouseStore.getState().parts.length).toBe(initialPartsCount + 1);
  });

  // Edge Case 4: Exchange Rate Safeguards
  it("should validate and reject non-positive exchange rates", () => {
    const successZero = useWarehouseStore.getState().setExchangeRate(0);
    const successNegative = useWarehouseStore.getState().setExchangeRate(-500);
    const successValid = useWarehouseStore.getState().setExchangeRate(1450);

    expect(successZero).toBe(false);
    expect(successNegative).toBe(false);
    expect(successValid).toBe(true);
    expect(useWarehouseStore.getState().settings.exchangeRate).toBe(1450);
  });

  // Edge Case 5: Out of Stock Add Operations
  it("should fail when attempting to add out of stock items directly to cart", () => {
    const outOfStockPart: Part = {
      id: "part-zero-qty",
      name: "Clutch Plate",
      nameKu: "پات بەش نوێ",
      partNumber: "CLUTCH-0",
      condition: "new",
      supplier: "Ahmad Auto",
      buyPriceUSD: 80.00,
      sellPriceIQD: 120000,
      quantity: 0, // Quantity is zero
      lowStockThreshold: 2,
      compatibleCars: [],
      status: "outOfStock",
    };

    useWarehouseStore.getState().addPart(outOfStockPart);
    const addedToCart = useWarehouseStore.getState().addToCart(outOfStockPart.id);

    expect(addedToCart).toBe(false);
    expect(useWarehouseStore.getState().cart.length).toBe(0);
  });

  // Edge Case 6: Transaction Total Mismatches
  it("should block sale completion if the customer amount paid is less than total price", () => {
    const testPart: Part = {
      id: "part-checkout-check",
      name: "Thermostat",
      nameKu: "پات بەش نوێ",
      partNumber: "THERMO-7",
      condition: "new",
      supplier: "Ahmad Auto",
      buyPriceUSD: 15.00,
      sellPriceIQD: 25000,
      quantity: 10,
      lowStockThreshold: 3,
      compatibleCars: [],
      status: "inStock",
    };

    useWarehouseStore.getState().addPart(testPart);
    useWarehouseStore.getState().addToCart(testPart.id);
    
    // Total is 25000. Customer pays 20000 (insufficient)
    const success = useWarehouseStore.getState().completeSale(20000, 0);

    expect(success).toBe(false);
    expect(useWarehouseStore.getState().salesHistory.length).toBe(0); // Cart is not completed
    expect(useWarehouseStore.getState().cart.length).toBe(1); // Item remains in cart
  });
});
