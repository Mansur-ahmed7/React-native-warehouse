export type Condition = 'new' | 'used' | 'refurbished';
export type StockStatus = 'inStock' | 'lowStock' | 'outOfStock';
export type Language = 'en' | 'ku';
export type Theme = 'light' | 'dark';
export type TabName = 'inventory' | 'scanner' | 'sale' | 'reports' | 'settings';

export type CompatibleCar = {
  brand: string;
  model: string;
  yearFrom: number;
  yearTo: number;
};

export type Brand = string;
export type ItemCondition = 'New' | 'Used' | 'Refurbished';
export type CarCompatibility = CompatibleCar & {
  id: string;
};

export type Part = {
  id: string;
  name: string;
  nameKu: string;
  imageUri?: string;
  partNumber: string;
  condition: Condition;
  supplier: string;
  buyPriceUSD: number;
  sellPriceIQD: number;
  quantity: number;
  lowStockThreshold: number;
  compatibleCars: CompatibleCar[];
  status: StockStatus;
  updated_at?: string;
};

export type CartItem = {
  partId: string;
  quantity: number;
  unitPrice: number;
};

export type SaleRecord = {
  id: string;
  receiptNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  changeReturned: number;
  timestamp: Date;
};

export type Customer = {
  id: string;
  name: string;
  initials: string;
  color: string;
  phone: string;
  specialty: string;
  balance: number;
};

export type Settings = {
  language: Language;
  theme: Theme;
  exchangeRate: number;
};
