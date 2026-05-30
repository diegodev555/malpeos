# MalpeOS Mobile App — Migration Analysis

## 1. What Can Be Reused Directly (from `@malpeos/shared`)

| Module | Source | Status |
|--------|--------|--------|
| `packages/shared/src/types/database.ts` | All DB types | ✅ Already shared |
| `packages/shared/src/types/index.ts` | Re-exports | ✅ Already shared |
| `packages/shared/src/theme/colors.ts` | Design tokens (oklch) | ✅ Already shared |
| `packages/shared/src/theme/typography.ts` | Font sizes, weights | ✅ Already shared |
| `packages/shared/src/theme/spacing.ts` | Spacing, border radii | ✅ Already shared |
| `packages/shared/src/theme/index.ts` | Re-exports | ✅ Already shared |
| `packages/shared/src/constants/index.ts` | Currency locale, codes | ✅ Already shared |
| `packages/shared/src/utils/format.ts` | formatCurrency, formatDate, etc. | ✅ Already shared |
| `packages/shared/src/utils/index.ts` | Re-exports | ✅ Already shared |
| `packages/shared/src/api/supabase.ts` | getSupabaseClient | ✅ Already shared |
| `packages/shared/src/api/index.ts` | Re-exports | ✅ Already shared |

## 2. What Should Be Shared Between Web & Mobile

| Item | Current Location | Move To |
|------|-----------------|---------|
| Database types | `packages/shared/src/types/database.ts` | ✅ Already shared |
| Theme tokens (colors, spacing, typography) | `packages/shared/src/theme/` | ✅ Already shared |
| Currency constants | `packages/shared/src/constants/` | ✅ Already shared |
| Utility functions | `packages/shared/src/utils/` | ✅ Already shared |
| Supabase client factory | `packages/shared/src/api/supabase.ts` | ✅ Already shared |
| **Validation schemas** | *Not ported yet* | Add to `packages/shared/src/validation/` |
| **Business logic** (trip calculations, balance computation) | *Not ported yet* | Add to `packages/shared/src/business/` |

## 3. What Must Be Rewritten for React Native

| Web Feature | Web File | Mobile Equivalent |
|-------------|----------|-------------------|
| Sidebar navigation | `src/components/nav-sidebar.tsx` | Bottom tab navigator |
| Layout with sidebar | `src/app/layout.tsx` | Tab + Stack navigator |
| Dashboard page | `src/app/page.tsx` | Dashboard screen |
| Trips list page | `src/app/trips/page.tsx` | Trips list screen |
| New trip form | `src/app/trips/new/page.tsx` | New trip screen (multi-step) |
| Bills/attachments page | `src/app/trips/bills/page.tsx` | Bills list screen |
| Boats (fleet) page | `src/app/boats/page.tsx` | Fleet management screen |
| Boat profile page | `src/app/boats/[id]/page.tsx` | Boat detail screen |
| Accounts page | `src/app/accounts/page.tsx` | Accounts/ledger screen |
| Account detail page | `src/app/accounts/[party_id]/page.tsx` | Account detail + ledger screen |
| Calendar page | `src/app/calendar/page.tsx` | Calendar screen |
| UI: Button | `src/components/ui/button.tsx` | `AppButton` component |
| UI: Card | `src/components/ui/card.tsx` | `AppCard` component |
| UI: Input | `src/components/ui/input.tsx` | `AppInput` component |
| UI: Badge | `src/components/ui/badge.tsx` | `Badge` component |
| UI: Table | `src/components/ui/table.tsx` | FlatList-based list |
| UI: Dialog | `src/components/ui/dialog.tsx` | Modal component |
| UI: Sheet | `src/components/ui/sheet.tsx` | Bottom sheet |
| Glass surface styling | `globals.css` glass-surface class | Custom StyleSheet pattern |
| Charts (recharts) | Dashboard + category charts | React-native-chart-kit or SVG |
| PDF generation (jsPDF) | Boat profile page | expo-print or native module |
| File upload/download | Trip bills | expo-file-system + expo-document-picker |

## 4. Mobile Architecture Decisions

### Navigation Structure
```
Bottom Tabs
├── Dashboard Tab (Stack)
│   └── Dashboard Screen
├── Trips Tab (Stack)
│   ├── Trips List Screen
│   ├── New Trip Screen
│   └── Bills Screen
├── Fleet Tab (Stack)
│   ├── Boats List Screen
│   └── Boat Detail Screen
├── Accounts Tab (Stack)
│   ├── Accounts List Screen
│   └── Account Detail Screen
└── Calendar Tab
    └── Calendar Screen
```

### Route Structure (Expo Router)
```
/app
  /(tabs)/
    _layout.tsx          — Tab navigator layout
    dashboard.tsx        — Dashboard screen
    trips.tsx            — Trips list
    trips/new.tsx        — New trip form
    trips/bills.tsx      — Bills management
    fleet.tsx            — Boats list
    fleet/[id].tsx       — Boat detail
    accounts.tsx         — Accounts list
    accounts/[party_id].tsx — Account detail
    calendar.tsx         — Calendar screen
  _layout.tsx            — Root layout (providers)
```

### State Management
- **React Query**: All server state (Supabase queries) using custom hooks
- **Zustand**: UI state (sidebar, filters, active modals)

### UI Components to Build
- `AppScreen` — Safe area wrapper with optional header
- `AppCard` — Glass-styled card matching web CSS
- `AppButton` — Styled button matching web
- `AppInput` — Form input matching web
- `Badge` — Status badge
- `KpiCard` — Dashboard metric card
- `EmptyState` — Empty state placeholder
- `ErrorState` — Error state with retry
- `LoadingState` — Loading indicator
- `ListItem` — Pressable list row
- `MetricRow` — Label + value row

## 5. Theme Matching Strategy

The web app uses oklch color values which are supported in React Native via `react-native-reanimated` or can be converted to hex/RGB. Since oklch is not natively supported in React Native StyleSheet, we'll:
- Keep oklch in the shared theme tokens for reference
- Create a mobile-specific theme that converts to RGBA for use in StyleSheet
- Also provide a helper to use oklch strings where possible (expo supports oklch in newer versions)

## 6. Screen Mapping

| Web Route | Mobile Screen | Tab | Notes |
|-----------|--------------|-----|-------|
| `/` | Dashboard | Dashboard | KPI cards, bar chart (native), category list |
| `/trips` | Trips | Trips | FlatList with trip cards, pull-to-refresh |
| `/trips/new` | NewTrip | Trips (modal) | Multi-section form |
| `/trips/bills` | Bills | Trips | Trip selector + file list |
| `/boats` | Fleet | Fleet | FlatList with boat cards |
| `/boats/[id]` | BoatDetail | Fleet (stack) | Profile header + trip list |
| `/accounts` | Accounts | Accounts | FlatList with party cards |
| `/accounts/[party_id]` | AccountDetail | Accounts (stack) | Balance card + ledger entries |
| `/calendar` | Calendar | Calendar | Custom month/week view |