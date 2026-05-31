# Warehouse (Expo + React Native)

Mobile-first warehouse / auto-parts inventory app built with Expo Router.

## What’s inside

- **Inventory**: browse items, view stock, manage part details (including compatible cars).
- **Barcode scanner**: scan a part number to find items fast (Expo Camera).
- **Sale flow**: add items to cart, complete a sale, and show a receipt overlay.
- **Reports**: basic reporting screens for quick insights.
- **Onboarding + Auth routes**: simple app flow scaffolding.

> Note: current authentication is a local mock (see `store/useAuthStore.ts`). Data is stored locally using Zustand + AsyncStorage.

## Screenshots

<p>
  <img src="prompt_material/Inventory%20management%20app%20interface%20design.png" width="260" />
  <img src="prompt_material/05Sales%20transaction%20summary%20on%20mobile%20app.png" width="260" />
  <img src="prompt_material/04Barcode%20scanner%20app%20interface%20design.png" width="260" />
</p>

## Tech stack

- Expo SDK 54 + Expo Router
- React Native
- NativeWind (Tailwind-style classes)
- Zustand + AsyncStorage
- Expo Camera / Print / Sharing

## Running locally

### Prerequisites

- Node.js 18+ recommended
- Expo CLI (optional)

### Install

```bash
npm install
```

### Start

```bash
npm run start
```

Common shortcuts:

```bash
npm run android
npm run ios
npm run web
```

### Lint

```bash
npm run lint
```

## Project structure

- `app/`: Expo Router routes (file-based navigation)
- `components/`: UI + feature tabs (Inventory, Scanner, Sale, Reports, Settings)
- `store/`: Zustand stores
- `data/`: seed/sample data
- `types/`: shared types

## Submission / review checklist

- No secrets committed (API keys/tokens)
- No local logs/build outputs committed (`.expo/`, `expo-start*.log` are ignored)
- Clear steps to run from a fresh clone

## License

MIT — see `LICENSE`.
