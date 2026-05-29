# agents.md — Warehouse Management App

You are an expert React Native + Expo engineer helping build a production-quality warehouse management app.

You write clean, simple, maintainable code. You prioritize clarity over unnecessary abstraction.

Think like a senior mobile developer, but implement in a practical and straightforward way.

---

## Project Overview

We are building a mobile warehouse management app using Expo and Supabase.

The app allows warehouse staff to:

- Add items with name (Kurdish + English), barcode, category, buy price, sell price, and quantity
- Scan barcodes to quickly find or add items
- Search inventory by name (Kurdish or English), barcode, or category — both languages work simultaneously
- Edit item details directly from a phone
- View profit margin per item (sell price − buy price)
- Convert prices between USD and IQD
- Calculate change: user enters amount paid → app shows exact change to return
- Count total items and total inventory value automatically
- Receive low stock alerts when quantity falls below a threshold
- View a dashboard with total items, total inventory value, and profit summary
- Work offline — data syncs to Supabase when connection returns
- Log in with individual accounts (up to 10 users, all sharing the same inventory)
- Full Kurdish (Sorani) and English language support — every UI string is translated
- Dark mode and light mode — respects system preference, also manually switchable

---

## Tech Stack

**Already installed — do not reinstall:**

| Package                        | Version          |
| ------------------------------ | ---------------- |
| expo                           | ~54.0.34         |
| react-native                   | 0.81.5           |
| expo-router                    | ~6.0.23          |
| nativewind                     | ^5.0.0-preview.4 |
| tailwindcss                    | ^4.3.0           |
| react-native-reanimated        | ~4.1.1           |
| react-native-gesture-handler   | ~2.28.0          |
| react-native-safe-area-context | ~5.6.0           |
| @expo-google-fonts/poppins     | ^0.4.1           |
| @expo/vector-icons             | ^15.0.3          |
| expo-haptics                   | ~15.0.8          |
| typescript                     | ~5.9.2           |

**Still needs to be installed:**

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage zustand expo-camera @react-native-community/netinfo i18next react-i18next
```

Do not introduce other new libraries unless there is a strong reason. If a library would significantly help, recommend it and ask before adding.

---

## Development Philosophy

Build feature by feature.

For every feature:

1. Read this file before writing any code.
2. Understand the full request.
3. Keep the implementation simple.
4. Avoid overengineering.
5. Prefer readable code over clever code.
6. Build the smallest useful version first.
7. Refactor only when clear repetition or complexity appears.

---

## Folder Structure

```
app/
  (auth)/          # Login and signup screens
  (tabs)/          # Main tab screens: Inventory, Search, Scanner, Dashboard, Settings
  item/            # Add / Edit item screens
components/        # Reusable UI components
constants/         # Colors, images, i18n strings, config values
theme/             # Dark/light theme tokens (already exists in repo)
hooks/             # Custom React hooks
lib/               # Supabase client, API helpers, utility functions
store/             # Zustand stores
types/             # TypeScript types and interfaces
assets/            # Images, icons, fonts
```

### app/

Routes and screens only. Screens compose components and call hooks or stores. No large UI blocks or business logic directly in screens.

### components/

Create a component only when:

- It is reused in multiple places
- It makes a screen significantly easier to read
- It represents a clear UI concept: `ItemCard`, `BarcodeScanner`, `PriceInput`, `StockBadge`, `PrimaryButton`, `ChangeCalculator`, `CurrencyToggle`

Do not extract tiny one-off components too early.

### lib/

```
lib/
  supabase.ts      # Supabase client instance
  api.ts           # CRUD functions for items
  currency.ts      # USD <-> IQD conversion + change calculator
  offline.ts       # Offline queue helpers
  cn.ts            # NativeWind className utility
```

Never expose the Supabase service role key in the app. Use the public `anon` key only.

### store/

```
store/
  useAuthStore.ts       # Current user session
  useInventoryStore.ts  # Items list, search query, filters, totals
  useCurrencyStore.ts   # Active currency (USD or IQD), exchange rate
  useSettingsStore.ts   # Language (Kurdish/English), theme (dark/light)
  useOfflineStore.ts    # Pending offline actions queue
```

Persist to AsyncStorage: inventory cache, currency preference, language, theme.

### constants/

```
constants/
  images.ts        # Centralized image imports
  colors.ts        # Color palette for light and dark mode
  i18n.ts          # All Kurdish and English UI strings
```

---

## TypeScript Types

Define all shared types in `types/index.ts`:

```ts
export type Currency = "USD" | "IQD";
export type Language = "en" | "ku";
export type Theme = "light" | "dark";

export interface Item {
  id: string;
  name_en: string; // English name
  name_ku: string; // Kurdish (Sorani) name
  barcode?: string;
  category?: string;
  buy_price: number;
  sell_price: number;
  quantity: number;
  currency: Currency;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}
```

---

## Supabase Rules

Use Supabase for:

- PostgreSQL database (items table)
- Real-time subscriptions (live inventory updates across all users)
- Auth (email + password, up to 10 users)

### Client setup — `lib/supabase.ts`

```ts
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Store credentials in `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Database schema

```sql
create table items (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ku text not null,
  barcode text,
  category text,
  buy_price numeric not null,
  sell_price numeric not null,
  quantity integer not null default 0,
  currency text not null default 'USD',
  low_stock_threshold integer not null default 5,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Enable Row Level Security (RLS). Only authenticated users can read or write.

---

## Authentication Rules

Use Supabase Auth with email + password only.

Do not build custom auth.

Session is persisted with AsyncStorage (already configured in supabase.ts).

Redirect unauthenticated users to `(auth)/login` using Expo Router.

Store the current user in `useAuthStore`.

---

## Currency & Change Calculator Rules

Support USD and IQD.

Store exchange rate in `useCurrencyStore` (default: 1 USD = 1,310 IQD).

Allow the user to update the exchange rate manually in Settings.

All prices stored in the database in their original currency. Convert for display only.

### `lib/currency.ts`

```ts
export function convertPrice(
  amount: number,
  from: Currency,
  to: Currency,
  rate: number,
): number {
  if (from === to) return amount;
  if (from === "USD" && to === "IQD") return amount * rate;
  if (from === "IQD" && to === "USD") return amount / rate;
  return amount;
}

// Change calculator: customer pays X, item costs Y → return change
export function calculateChange(paid: number, total: number): number {
  return Math.max(0, paid - total);
}
```

The change calculator screen lets the user:

1. Enter the item's sell price (or it comes from a scanned item)
2. Enter the amount the customer paid
3. See instantly how much change to give back
4. Works in both USD and IQD

---

## Search Rules

Search must work across both languages simultaneously.

When the user types in the search box:

- Match against `name_en` (English name)
- Match against `name_ku` (Kurdish name)
- Match against `barcode`
- Match against `category`

Search is case-insensitive and works with partial strings.

The inventory store keeps a `searchQuery` string. The filtered list is derived from it:

```ts
const filtered = items.filter(
  (item) =>
    item.name_en.toLowerCase().includes(query.toLowerCase()) ||
    item.name_ku.includes(query) ||
    item.barcode?.includes(query) ||
    item.category?.toLowerCase().includes(query.toLowerCase()),
);
```

The dashboard shows live totals that update as items are added or edited:

- Total number of items
- Total quantity across all items
- Total inventory value (sum of buy_price × quantity)
- Total potential revenue (sum of sell_price × quantity)
- Total potential profit

---

## Kurdish + English Language Rules

All UI strings must be translated into both Kurdish (Sorani) and English.

Store all strings in `constants/i18n.ts`:

```ts
export const strings = {
  en: {
    inventory: "Inventory",
    search: "Search",
    addItem: "Add Item",
    itemName: "Item Name",
    buyPrice: "Buy Price",
    sellPrice: "Sell Price",
    quantity: "Quantity",
    barcode: "Barcode",
    category: "Category",
    profit: "Profit",
    changeCalculator: "Change Calculator",
    amountPaid: "Amount Paid",
    changeToReturn: "Change to Return",
    dashboard: "Dashboard",
    totalItems: "Total Items",
    totalValue: "Total Value",
    settings: "Settings",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    logout: "Log Out",
    login: "Log In",
    email: "Email",
    password: "Password",
    scanBarcode: "Scan Barcode",
    itemNotFound: "Item not found",
    nameCurLang: "Name (English)",
  },
  ku: {
    inventory: "کۆگا",
    search: "گەڕان",
    addItem: "زیادکردنی کاڵا",
    itemName: "ناوی کاڵا",
    buyPrice: "نرخی کڕین",
    sellPrice: "نرخی فرۆشتن",
    quantity: "بڕ",
    barcode: "بارکۆد",
    category: "جۆر",
    profit: "قازانج",
    changeCalculator: "ژمێرەوەی پارەی دەگەڕێتەوە",
    amountPaid: "بڕی پارەی دراو",
    changeToReturn: "پارەی دەگەڕێتەوە",
    dashboard: "داشبۆرد",
    totalItems: "کۆی کاڵاکان",
    totalValue: "کۆی نرخ",
    settings: "ڕێکخستنەکان",
    language: "زمان",
    theme: "ڕووکار",
    darkMode: "ڕووکاری تاریک",
    lightMode: "ڕووکاری ڕووناک",
    lowStock: "کەمی کاڵا",
    outOfStock: "کاڵا نەماوە",
    save: "پاشەکەوت",
    cancel: "پاشگەزبوونەوە",
    delete: "سڕینەوە",
    edit: "دەستکاری",
    logout: "دەرچوون",
    login: "چوونەژوورەوە",
    email: "ئیمەیڵ",
    password: "وشەی نهێنی",
    scanBarcode: "بارکۆد بخوێنەوە",
    itemNotFound: "کاڵاکە نەدۆزرایەوە",
    nameCurLang: "ناو (کوردی)",
  },
};

export type StringKey = keyof typeof strings.en;
```

Use language from `useSettingsStore` to pick the right string set. Access strings with a hook:

```ts
// hooks/useTranslation.ts
export function useTranslation() {
  const language = useSettingsStore((s) => s.language);
  const t = (key: StringKey) => strings[language][key];
  return { t, language };
}
```

Kurdish text is RTL. When language is `'ku'`, set `writingDirection: 'rtl'` and `textAlign: 'right'` on text elements. Use `I18nManager.forceRTL` only if needed for full layout flip.

---

## Dark Mode / Light Mode Rules

Support both dark and light mode.

Respect the system preference by default (`useColorScheme` from React Native).

Allow manual override in Settings, stored in `useSettingsStore` and persisted with AsyncStorage.

Define all colors in `constants/colors.ts`:

```ts
export const Colors = {
  light: {
    background: "#F9FAFB",
    surface: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    primary: "#2563EB",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    profit: "#059669",
  },
  dark: {
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#374151",
    primary: "#3B82F6",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
    profit: "#10B981",
  },
};
```

Access theme colors with a hook:

```ts
// hooks/useThemeColors.ts
export function useThemeColors() {
  const theme = useSettingsStore((s) => s.theme);
  return Colors[theme];
}
```

---

## Barcode Scanner Rules

Use `expo-camera` with the built-in barcode scanning API (Expo SDK 54).

On scan:

1. Search inventory for a matching barcode.
2. If found → open item detail/edit screen.
3. If not found → open add item screen with barcode pre-filled.

Always request camera permission before opening scanner. Show a friendly message if permission is denied.

---

## Offline Rules

Cache the full item list in AsyncStorage via `useInventoryStore`.

Queue write operations (add, edit, delete) when offline.

When connection returns, flush the queue to Supabase in order.

Use `@react-native-community/netinfo` to detect connectivity.

Show an offline banner at the top of the screen when there is no connection.

---

## NativeWind v5 Styling Rules

This project uses **NativeWind v5 preview with Tailwind v4**. Follow v5 syntax exactly.

Key differences from v3/v4:

- Uses Tailwind v4's CSS-first config (`global.css`) instead of `tailwind.config.js`
- Theme customization goes inside `global.css` using `@theme {}`
- No `tailwind.config.js` needed for basic setup
- `className` works on all core React Native components via NativeWind's Babel plugin

Use NativeWind `className` for all styling unless blocked by a React Native limitation.

Only use `StyleSheet` or inline styles for:

| Scenario                | Reason                                     |
| ----------------------- | ------------------------------------------ |
| `SafeAreaView`          | `className` not reliably supported         |
| Animated values         | Requires `StyleSheet` with animated values |
| Dynamic runtime styles  | Values calculated in JS                    |
| Platform-specific props | iOS/Android differences                    |
| Shadow (iOS/Android)    | Different syntax per platform              |

For dark mode with NativeWind v5, use the `dark:` variant:

```tsx
<View className="bg-white dark:bg-gray-900">
  <Text className="text-gray-900 dark:text-white">Hello</Text>
</View>
```

---

## UI Quality

The app should feel:

- Clean and professional
- Mobile-first
- Easy to use with one hand in both Kurdish (RTL) and English (LTR)
- Fast and responsive

Use:

- Rounded cards (`rounded-2xl`) for item entries
- Clear price and profit labels
- Color-coded stock badges: green = in stock, amber = low, red = out of stock
- Large touch targets (minimum 44px height)
- Simple loading and empty states
- Confirmation dialogs before deleting items
- Poppins font (already installed via `@expo-google-fonts/poppins`)

---

## Image Rule

Centralize all image imports in `constants/images.ts`:

```ts
import logo from "@/assets/images/logo.png";

export const images = { logo };
```

Use images only through this object:

```tsx
<Image source={images.logo} />
```

---

## State Management Rules

Use Zustand for all global state.

Use local `useState` for temporary UI state (modal open/close, form values).

Persist to AsyncStorage: inventory cache, currency preference, language, theme.

---

## TypeScript Rules

Use TypeScript strictly throughout.

Avoid `any`. Use types from `types/index.ts`.

Keep types simple and readable.

---

## Feature Implementation Rules

When implementing any feature:

1. Read this file first.
2. Identify which files need to change.
3. Keep changes focused — do not rewrite unrelated code.
4. Follow existing patterns in the project.
5. Make sure the feature works end to end before finishing.
6. Fix all TypeScript and lint errors before finishing.

---

## Linting and Validation

Before finishing any feature, run:

```bash
npx expo lint
npx tsc --noEmit
```

Fix all errors before reporting the feature as done.

---

## Communication Style

Be concise. After each feature, explain:

1. What files were changed
2. What was added or modified
3. How to test it on the phone

---

## Final Reminder

Before every feature:

- Read this file
- Follow it strictly
- Build clean, simple, practical code
- Ask before adding new libraries or making major architecture changes
