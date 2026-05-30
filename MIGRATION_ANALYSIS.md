# Migration Analysis: malpeOS Web → Cross-Platform

## 1. Existing Web App Overview

The current web app is a **Next.js 16** application for fleet management & financial tracking for commercial fishing operations. It uses:

- **Framework:** Next.js 16 (App Router)
- **UI Library:** shadcn/ui with @base-ui/react primitives
- **Styling:** Tailwind CSS v4 + CSS custom properties (oklch colors)
- **State:** Local React state (useState/useEffect) + supabase client
- **Backend:** Supabase (PostgreSQL + storage)
- **Charts:** Recharts (bar + pie charts for dashboard)
- **Icons:** lucide-react
- **Calendar:** react-big-calendar
- **Tables:** Custom shadcn table components
- **Dialogs/Modals:** shadcn Dialog (base-ui)
- **Notifications:** sonner toast

### Pages/Screens:
1. **Dashboard** `/` — KPI cards, revenue vs expenses bar chart, expenses by category pie chart
2. **Trips** `/trips` — Trip list table with file upload per trip
3. **New Trip** `/trips/new` — Trip creation form
4. **Bills** `/trips/bills` — Bills management
5. **Accounts** `/accounts` — Party ledger management
6. **Accounts Detail** `/accounts/[party_id]` — Individual party ledger
7. **Boats** `/boats` — Fleet manager
8. **Boat Detail** `/boats/[id]` — Individual boat view
9. **Calendar** `/calendar` — Trip calendar view

### Key Components:
- `NavSidebar` — Glass-morphism sidebar with mobile sheet drawer
- UI primitives: Button, Card, Input, Badge, Dialog, Table, Calendar, Select, Sheet, etc.

### Design Language:
- **Glass morphism** — frosted glass surfaces with backdrop-filter blur
- **Colors:** oklch color space, soft blue-gray background, primary blue
- **Typography:** System fonts (SF Pro), large headings, clean hierarchy
- **Cards:** Rounded (2xl=16px), glass surfaces with subtle shadows
- **Buttons:** Rounded-xl, primary blue with shadow, glass variants

---

## 2. Migration Strategy

### What Can Be Reused Directly

| Artifact | How |
|----------|-----|
| Database types (`src/types/database.ts`) | Extracted to `packages/shared/src/types/database.ts` |
| Formatting utilities (`formatCurrency`) | Extracted to `packages/shared/src/utils/format.ts` |
| Constants (expense categories, etc.) | Extracted to `packages/shared/src/constants/index.ts` |
| Design tokens (colors, typography, spacing) | Extracted to `packages/shared/src/theme/` |
| Supabase client factory | Extracted to `packages/shared/src/api/supabase.ts` (now supports both web & mobile) |

### What Should Be Shared Between Web and Mobile

| Feature | Shared Package | Notes |
|---------|---------------|-------|
| Types & Interfaces | `@malpeos/shared/types` | Database shapes, form types, dashboard types |
| Constants | `@malpeos/shared/constants` | Categories, statuses, currency config |
| Format Utils | `@malpeos/shared/utils` | formatCurrency, formatDate, getErrorMessage |
| Design Tokens | `@malpeos/shared/theme` | Colors, typography, spacing, radii |
| API Client | `@malpeos/shared/api` | getSupabaseClient (unified for web + mobile) |

### What Must Be Rewritten for React Native

| Web Feature | Mobile Equivalent |
|-------------|-------------------|
| Next.js App Router | Expo Router (file-based routing) |
| shadcn/ui components | Custom React Native components (Card, Button, Input, Badge, etc.) |
| Recharts (SVG charts) | Manual chart views (bar chart, progress bars) or react-native-chart-kit |
| lucide-react icons | emoji/SVG/vector icons (or react-native-lucide-icons) |
| Tailwind CSS (web) | NativeWind or StyleSheet objects |
| react-big-calendar | Custom calendar with RN CalendarList |
| sonner toasts | Custom toast or react-native-toast-message |
| shadcn Dialog/Sheet | React Native Modal with custom animations |
| Next.js Link navigation | Expo Router (router.push) |
| next-themes (dark mode) | Custom theme context with useColorScheme |

### Shared with Web Target

- The same `@malpeos/shared` package works for web (via Next.js alias)
- Shared types, utils, constants, theme tokens
- API client (Supabase) works identically on both platforms
- Business logic (dashboard calculations, trip aggregation) is shared

---

## 3. New Project Structure

```
malpeos/
├── apps/
│   ├── web/              # Existing Next.js app (unchanged)
│   │   ├── src/
│   │   │   ├── app/      # Existing Next.js pages
│   │   │   ├── components/
│   │   │   └── lib/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/           # NEW: Expo app
│       ├── src/
│       │   ├── app/          # Expo Router pages
│       │   │   ├── _layout.tsx
│       │   │   ├── index.tsx         # Dashboard
│       │   │   ├── trips.tsx          # Trips list
│       │   │   └── ...
│       │   ├── components/
│       │   │   ├── ui/        # Reusable UI primitives
│       │   │   │   ├── Card.tsx
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Input.tsx
│       │   │   │   ├── Badge.tsx
│       │   │   │   └── EmptyState.tsx
│       │   │   └── NavSidebar.tsx
│       │   ├── hooks/
│       │   │   └── useSupabaseQuery.ts
│       │   ├── store/
│       │   │   └── useAppStore.ts
│       │   └── lib/
│       │       └── cn.ts
│       ├── app.json
│       ├── package.json
│       ├── tsconfig.json
│       ├── babel.config.js
│       └── metro.config.js
│
├── packages/
│   └── shared/           # NEW: Shared code
│       ├── src/
│       │   ├── api/
│       │   │   └── supabase.ts
│       │   ├── types/
│       │   │   └── database.ts
│       │   ├── utils/
│       │   │   └── format.ts
│       │   ├── constants/
│       │   │   └── index.ts
│       │   └── theme/
│       │       ├── colors.ts
│       │       ├── typography.ts
│       │       ├── spacing.ts
│       │       └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── package.json          # Root workspace (optional)
└── MIGRATION_ANALYSIS.md
```

---

## 4. Mobile Setup

### Tech Stack
- **Framework:** Expo SDK 53 with prebuild support
- **Navigation:** Expo Router (file-based, similar to Next.js App Router)
- **Networking:** Supabase JS + React Query
- **State:** Zustand
- **Animations:** react-native-reanimated
- **Gestures:** react-native-gesture-handler
- **Screens:** react-native-screens
- **Safe Area:** react-native-safe-area-context
- **HTTP:** Axios

### Native Folders
- `apps/mobile/android` — Generated via `npx expo prebuild`
- `apps/mobile/ios` — Generated via `npx expo prebuild`

### Run Commands
```bash
# Development
cd apps/mobile && npx expo start

# Web target
cd apps/mobile && npx expo start --web

# iOS
cd apps/mobile && npx expo start --ios

# Android
cd apps/mobile && npx expo start --android

# Prebuild for native folders
cd apps/mobile && npx expo prebuild
```

---

## 5. What to Migrate Next (Priority Order)

1. **Auth** — Add Supabase Auth with phone/email login (shared across platforms)
2. **Trip Creation** — Port `/trips/new` with form validation (React Hook Form + Zod)
3. **Boat Management** — Port boats list + detail screens
4. **Account Ledger** — Port accounts + party detail screens
5. **Calendar View** — Port calendar with RN CalendarList
6. **Bill Upload** — Port file upload with RN ImagePicker + DocumentPicker
7. **Push Notifications** — Expo Notifications
8. **Dark Mode** — Theme switching with useColorScheme
9. **Offline Support** — React Query persistence + Supabase offline sync