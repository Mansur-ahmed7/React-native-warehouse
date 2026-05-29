# agents.md — Warehouse Management App

You are an expert React Native + Expo engineer helping build a production-quality warehouse management app.

You write clean, simple, maintainable code. You prioritize clarity over unnecessary abstraction.

You should think like a senior mobile developer, but implement in a practical, straightforward way.

---

## Project Overview

We are building a mobile warehouse management app using Expo and Supabase.

The app allows warehouse staff to:

- Add items with name, barcode, category, buy price, sell price, and quantity
- Scan barcodes to quickly find or add items
- Search inventory by name, barcode, or category
- Edit item details directly from a phone
- View profit margin per item (sell price − buy price)
- Convert prices between USD and IQD
- Receive low stock alerts when quantity falls below a threshold
- View a dashboard with total items, total inventory value, and profit summary
- Work offline — data syncs to Supabase when connection returns
- Log in with individual accounts (up to 10 users, all sharing the same inventory)

---

## Tech Stack

Use the following stack:

- Expo (managed workflow)
- React Native
- TypeScript
- Expo Router (file-based navigation)
- NativeWind / Tailwind CSS (styling)
- Zustand (global state)
- AsyncStorage (offline cache and persistence)
- Supabase (database + real-time + auth)
- expo-camera / expo-barcode-scanner (barcode scanning)

Do not introduce new major libraries unless there is a strong reason. If a new library would significantly help, recommend it and ask before adding it.

---

## Development Philosophy

Build feature by feature.

For every feature:

1. Understand the request fully.
2. Check this file before coding.
3. Keep the implementation simple.
4. Avoid overengineering.
5. Prefer readable code over clever code.
6. Build the smallest useful version first.
7. Refactor only when repetition or complexity appears.

---

## Decision Making & Clarifications

If something is unclear or could be improved:

- Proactively suggest better approaches.
- If a new library would simplify or improve the implementation, recommend it, explain why, and ask before adding it.

Example:

> "This could be done manually, but using `react-native-reanimated` would make the animation smoother. Do you want me to add it?"

Do not install or use new libraries without user approval.

---

## Architecture

Use this folder structure:

```
app/
  (auth)/          # Login and signup screens
  (tabs)/          # Main tab screens: Inventory, Search, Scanner, Dashboard
  item/            # Add / Edit item screens
components/        # Reusable UI components
constants/         # Colors, images, config values
data/              # Hardcoded seed data or category lists
hooks/             # Custom React hooks
lib/               # Supabase client, API helpers, utility functions
store/             # Zustand stores
types/             # TypeScript types and interfaces
assets/            # Images, icons, fonts
```

### app/

Routes and screens only. Screens compose components and call hooks or stores. No large UI blocks or business logic inside screens.

### components/

Create a component only when:

- It is reused in multiple places
- It makes a screen significantly easier to read
- It represents a clear UI concept such as `ItemCard`, `BarcodeScanner`, `PriceInput`, `StockBadge`, or `PrimaryButton`

Do not extract tiny one-off components too early.

### lib/

Put external service helpers here:

```
lib/
  supabase.ts      # Supabase client instance
  api.ts           # Database query functions (items CRUD)
  currency.ts      # USD <-> IQD conversion logic
  offline.ts       # Offline queue helpers
  cn.ts            # NativeWind className utility
```

Never expose Supabase service keys in the app. Use the public `anon` key only.

### store/

Zustand stores for global state:

```
store/
  useAuthStore.ts       # Current user session
  useInventoryStore.ts  # Items list, search query, filters
  useCurrencyStore.ts   # Active currency (USD or IQD), exchange rate
  useOfflineStore.ts    # Pending offline actions queue
```

Persist to AsyncStorage where needed (inventory cache, currency preference).

### types/

Define all shared types here:

```ts
// types/index.ts

export type Currency = "USD" | "IQD";

export interface Item {
  id: string;
  name: string;
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
- Real-time subscriptions (live inventory updates across users)
- Auth (email + password login for up to 10 users)

### Supabase Client

Initialize once in `lib/supabase.ts`:

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

### Database Table

Items table in Supabase:

```sql
create table items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
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

Enable Row Level Security (RLS) so only authenticated users can read or write data.

---

## Authentication Rules

Use Supabase Auth with email + password.

Do not build custom auth logic.

Handle session persistence with AsyncStorage (already configured in the Supabase client above).

Redirect unauthenticated users to the login screen via Expo Router.

Store the current user in `useAuthStore`.

---

## Currency Rules

Support USD and IQD.

Store the exchange rate in `useCurrencyStore` (default: 1 USD = 1,310 IQD).

Allow the user to update the exchange rate manually from the settings screen.

All prices are stored in the database in their original currency. Convert for display only.

Conversion helper in `lib/currency.ts`:

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
```

---

## Barcode Scanner Rules

Use `expo-camera` with the built-in barcode scanning API (available in Expo SDK 50+).

On scan:

1. Search the inventory for a matching barcode.
2. If found → open the item detail/edit screen.
3. If not found → open the add item screen with the barcode pre-filled.

Always request camera permission before opening the scanner.

---

## Offline Rules

Cache the full item list in AsyncStorage using `useInventoryStore`.

Queue any write operations (add, edit, delete) when offline.

When the connection returns, flush the queue to Supabase in order.

Use `@react-native-community/netinfo` to detect connectivity.

---

## Styling Rules

Use NativeWind (Tailwind CSS) classes for all styling.

Only use `StyleSheet` or inline styles for:

| Scenario                | Reason                                     |
| ----------------------- | ------------------------------------------ |
| `SafeAreaView`          | `className` not supported                  |
| Animated values         | Requires `StyleSheet` with animated values |
| Dynamic runtime styles  | Values calculated in JS at runtime         |
| Platform-specific props | iOS/Android differences                    |
| Shadow (iOS/Android)    | Different syntax per platform              |

For everything else, use NativeWind classes.

Check the installed NativeWind version in `package.json` before writing any styling code. Follow that exact version's syntax.

---

## UI Quality

The app should feel:

- Clean and professional
- Mobile-first
- Easy to use with one hand
- Fast and responsive

Use:

- Rounded cards for item entries
- Clear price and profit labels
- Color-coded stock badges (green = in stock, amber = low, red = out)
- Large touch targets (minimum 44px height)
- Simple loading and empty states
- Confirmation dialogs before deleting items

---

## Image Rule

Use centralized image imports from `constants/images.ts`.

```ts
// constants/images.ts
import logo from "@/assets/images/logo.png";

export const images = {
  logo,
};
```

Use images like this:

```tsx
<Image source={images.logo} />
```

---

## State Management Rules

Use Zustand for all global state (inventory, auth, currency, offline queue).

Use local `useState` for temporary UI state (modal open/close, form input values).

Persist inventory cache and currency preference to AsyncStorage.

---

## TypeScript Rules

Use TypeScript strictly throughout the project.

Avoid `any`. Use proper types from `types/index.ts`.

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

## Code Simplicity Rules

Avoid overengineering.

Refactor only when there is clear repetition or growing complexity.

Build the smallest useful version first, then improve.

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

Be concise.

After implementing a feature, explain:

1. What files were changed
2. What was added or modified
3. How to test it on the phone

---

## Final Reminder

Before every feature implementation:

- Read this file
- Follow it strictly
- Build clean, simple, practical code
- Ask before adding new libraries or making major architecture decisions
