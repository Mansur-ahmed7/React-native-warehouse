import { create } from "zustand";
import { Part, CartItem, SaleRecord, Customer, Settings, Language, Theme, TabName, StockStatus } from "../types/inventory";
import { initialParts } from "../data/parts";
import { initialCustomers } from "../data/customers";

interface WarehouseStore {
  // State slices
  parts: Part[];
  cart: CartItem[];
  salesHistory: SaleRecord[];
  activeSaleRecord: SaleRecord | null;
  customers: Customer[];
  settings: Settings;
  activeTab: TabName;
  showReceipt: boolean;
  recentScans: string[];

  // Actions
  // Inventory actions
  addPart: (part: Part) => boolean;
  updatePart: (id: string, updates: Partial<Part>) => boolean;
  deletePart: (id: string) => void;
  getPartById: (id: string) => Part | undefined;
  deriveStatus: (qty: number, threshold: number) => StockStatus;

  // Cart actions
  addToCart: (partId: string) => boolean;
  removeFromCart: (partId: string) => void;
  updateCartQty: (partId: string, qty: number) => void;
  clearCart: () => void;
  cartItemCount: () => number;

  // Sale actions
  completeSale: (amountPaid: number, discount: number) => boolean;
  settleCustomerDebt: (customerId: string) => void;

  // Scanner actions
  addRecentScan: (partId: string) => void;

  // Settings actions
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setExchangeRate: (rate: number) => boolean;

  // Navigation actions
  setActiveTab: (tab: TabName) => void;
  setShowReceipt: (show: boolean) => void;

  // Toast actions
  toast: { message: string; isError?: boolean } | null;
  triggerToast: (message: string, isError?: boolean) => void;
}

export const useWarehouseStore = create<WarehouseStore>((set, get) => ({
  // Initial States
  parts: initialParts,
  cart: [],
  salesHistory: [],
  activeSaleRecord: null,
  customers: initialCustomers,
  settings: {
    language: "en",
    theme: "light",
    exchangeRate: 1310,
  },
  activeTab: "inventory",
  showReceipt: false,
  recentScans: ["part-4", "part-1"], // prepopulate sample scans matching inventory IDs

  // Derive Stock Status Helper
  deriveStatus: (qty: number, threshold: number): StockStatus => {
    if (qty <= 0) return "outOfStock";
    if (qty <= threshold) return "lowStock";
    return "inStock";
  },

  // Inventory Actions
  addPart: (part: Part) => {
    try {
      // 1. Validation Guards
      if (!part.name || part.name.trim() === "") {
        get().triggerToast("✗ Part name cannot be empty", true);
        return false;
      }
      if (!part.partNumber || part.partNumber.trim() === "") {
        get().triggerToast("✗ Part number cannot be empty", true);
        return false;
      }
      if (part.quantity < 0) {
        get().triggerToast("✗ Quantity cannot be negative", true);
        return false;
      }
      if (part.lowStockThreshold < 0) {
        get().triggerToast("✗ Alert threshold cannot be negative", true);
        return false;
      }
      if (part.buyPriceUSD < 0 || part.sellPriceIQD < 0) {
        get().triggerToast("✗ Prices cannot be negative", true);
        return false;
      }

      // Check for duplicate part numbers
      const duplicate = get().parts.find(p => p.partNumber.toLowerCase() === part.partNumber.toLowerCase());
      if (duplicate) {
        get().triggerToast(`✗ Part number ${part.partNumber} already exists`, true);
        return false;
      }

      const derivedStatus = get().deriveStatus(part.quantity, part.lowStockThreshold);
      const completePart = { ...part, status: derivedStatus };
      
      set((state) => ({
        parts: [completePart, ...state.parts],
      }));
      return true;
    } catch (error) {
      console.error("Failed to add part:", error);
      get().triggerToast("✗ Failed to add part to inventory", true);
      return false;
    }
  },

  updatePart: (id: string, updates: Partial<Part>) => {
    try {
      // 1. Validation Guards for Updates
      if (updates.name !== undefined && updates.name.trim() === "") {
        get().triggerToast("✗ Part name cannot be empty", true);
        return false;
      }
      if (updates.partNumber !== undefined && updates.partNumber.trim() === "") {
        get().triggerToast("✗ Part number cannot be empty", true);
        return false;
      }
      if (updates.quantity !== undefined && updates.quantity < 0) {
        get().triggerToast("✗ Quantity cannot be negative", true);
        return false;
      }
      if (updates.lowStockThreshold !== undefined && updates.lowStockThreshold < 0) {
        get().triggerToast("✗ Alert threshold cannot be negative", true);
        return false;
      }
      if (updates.buyPriceUSD !== undefined && updates.buyPriceUSD < 0) {
        get().triggerToast("✗ Buy price cannot be negative", true);
        return false;
      }
      if (updates.sellPriceIQD !== undefined && updates.sellPriceIQD < 0) {
        get().triggerToast("✗ Sell price cannot be negative", true);
        return false;
      }

      set((state) => ({
        parts: state.parts.map((p) => {
          if (p.id === id) {
            const merged = { ...p, ...updates };
            merged.status = get().deriveStatus(merged.quantity, merged.lowStockThreshold);
            return merged;
          }
          return p;
        }),
      }));
      return true;
    } catch (error) {
      console.error("Failed to update part:", error);
      get().triggerToast("✗ Failed to update part details", true);
      return false;
    }
  },

  deletePart: (id: string) => {
    try {
      set((state) => ({
        parts: state.parts.filter((p) => p.id !== id),
        cart: state.cart.filter((c) => c.partId !== id),
      }));
    } catch (error) {
      console.error("Failed to delete part:", error);
      get().triggerToast("✗ Failed to delete part", true);
    }
  },

  getPartById: (id: string) => {
    return get().parts.find((p) => p.id === id);
  },

  // Cart Actions
  addToCart: (partId: string) => {
    try {
      const part = get().parts.find((p) => p.id === partId);
      if (!part) {
        get().triggerToast("✗ Product not found", true);
        return false;
      }
      if (part.quantity <= 0 || part.status === "outOfStock") {
        get().triggerToast("✗ Item is out of stock", true);
        return false; // Can't add if out of stock
      }

      let success = true;
      set((state) => {
        const existing = state.cart.find((c) => c.partId === partId);
        if (existing) {
          // Enforce stock limit
          if (existing.quantity >= part.quantity) {
            success = false;
            return state; 
          }
          return {
            cart: state.cart.map((c) =>
              c.partId === partId ? { ...c, quantity: c.quantity + 1 } : c
            ),
          };
        } else {
          return {
            cart: [...state.cart, { partId, quantity: 1, unitPrice: part.sellPriceIQD }],
          };
        }
      });

      if (!success) {
        get().triggerToast("✗ Cannot exceed available stock limit", true);
      }
      return success;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      return false;
    }
  },

  removeFromCart: (partId: string) => {
    try {
      set((state) => ({
        cart: state.cart.filter((c) => c.partId !== partId),
      }));
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    }
  },

  updateCartQty: (partId: string, qty: number) => {
    try {
      if (qty <= 0) {
        get().removeFromCart(partId);
        return;
      }

      const part = get().parts.find((p) => p.id === partId);
      if (!part) return;

      // Enforce stock limit
      if (qty > part.quantity) {
        get().triggerToast(`✗ Stock limit is ${part.quantity}`, true);
      }
      const finalQty = Math.min(qty, part.quantity);

      set((state) => ({
        cart: state.cart.map((c) =>
          c.partId === partId ? { ...c, quantity: finalQty } : c
        ),
      }));
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
    }
  },

  clearCart: () => {
    set({ cart: [] });
  },

  cartItemCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Sale Actions
  completeSale: (amountPaid: number, discount: number) => {
    try {
      const { cart, parts, salesHistory, deriveStatus } = get();
      if (cart.length === 0) {
        get().triggerToast("✗ Shopping cart is empty", true);
        return false;
      }

      // Check stock levels once more defensively before finalizing transaction
      for (const item of cart) {
        const part = parts.find(p => p.id === item.partId);
        if (!part || part.quantity < item.quantity) {
          get().triggerToast(`✗ Insufficient stock for ${part?.name || "item"}`, true);
          return false;
        }
      }

      // 1. Calculate totals securely
      const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const total = Math.max(0, subtotal - discount);
      
      if (amountPaid < total) {
        get().triggerToast("✗ Insufficient amount received", true);
        return false;
      }
      
      const changeReturned = Math.max(0, amountPaid - total);

      // 2. Decrement parts stock quantities & recalculate stock status status safely
      const updatedParts = parts.map((part) => {
        const inCart = cart.find((item) => item.partId === part.id);
        if (inCart) {
          const newQty = Math.max(0, part.quantity - inCart.quantity);
          const newStatus = deriveStatus(newQty, part.lowStockThreshold);
          return {
            ...part,
            quantity: newQty,
            status: newStatus,
          };
        }
        return part;
      });

      // 3. Assemble SaleRecord
      const receiptNumber = `#REC-${String(salesHistory.length + 1).padStart(4, "0")}`;
      const newRecord: SaleRecord = {
        id: `sale-${Date.now()}`,
        receiptNumber,
        items: [...cart],
        subtotal,
        discount,
        total,
        amountPaid,
        changeReturned,
        timestamp: new Date(),
      };

      // 4. Update store slices & navigation flags
      set((state) => ({
        parts: updatedParts,
        salesHistory: [newRecord, ...state.salesHistory], // Prepend for easy reverse history listings
        activeSaleRecord: newRecord,
        showReceipt: true,
        cart: [], // Clear shopping cart
      }));

      get().triggerToast("✓ Sale completed successfully!");
      return true;
    } catch (error) {
      console.error("Checkout process failed:", error);
      get().triggerToast("✗ Transaction failed during checkout", true);
      return false;
    }
  },

  settleCustomerDebt: (customerId: string) => {
    try {
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === customerId ? { ...c, balance: 0 } : c
        ),
      }));
      get().triggerToast("✓ Customer balance settled successfully");
    } catch (error) {
      console.error("Debt settlement failed:", error);
    }
  },

  // Scanner Actions
  addRecentScan: (partId: string) => {
    set((state) => {
      const filtered = state.recentScans.filter((id) => id !== partId);
      const updated = [partId, ...filtered].slice(0, 10);
      return { recentScans: updated };
    });
  },

  // Settings Actions
  setLanguage: (lang: Language) => {
    set((state) => ({
      settings: { ...state.settings, language: lang },
    }));
  },

  setTheme: (theme: Theme) => {
    set((state) => ({
      settings: { ...state.settings, theme },
    }));
  },

  setExchangeRate: (rate: number) => {
    if (rate <= 0 || Number.isNaN(rate)) {
      get().triggerToast("✗ Exchange rate must be greater than zero", true);
      return false;
    }
    set((state) => ({
      settings: { ...state.settings, exchangeRate: rate },
    }));
    return true;
  },

  // Navigation Actions
  setActiveTab: (tab: TabName) => {
    set({ activeTab: tab });
  },

  setShowReceipt: (show: boolean) => {
    set({ showReceipt: show });
  },

  // Toast State & Action
  toast: null,
  triggerToast: (message: string, isError = false) => {
    set({ toast: { message, isError } });
    setTimeout(() => {
      const current = get().toast;
      if (current && current.message === message) {
        set({ toast: null });
      }
    }, 2000);
  },
}));
