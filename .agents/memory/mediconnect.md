---
name: MediConnect Architecture
description: Key decisions for the MediConnect Expo mobile healthcare app
---

## Stack
- Expo (artifact: `artifacts/mobile`), Express API (artifact: `artifacts/api-server`)
- Frontend-only data: AsyncStorage via `AppContext` and `ChatContext`
- AI chat: OpenAI `gpt-4o-mini`, streamed SSE via `POST /ai/chat` on the api-server

## Color tokens (all in `constants/colors.ts` → `colors.light`)
Custom extras beyond the scaffold: `chatBackground`, `starColor`, `successBg/Text`, `warningBg/Text`, `errorBg/Text`, `chatUserBubble`, `chatAIBubble`, `headerBg`.

## Key patterns
- `useColors()` hook returns `{ ...colors.light, radius }` — all tokens available
- `ChatContext` stores messages newest-first; FlatList is `inverted` so newest appears at bottom
- SSE streaming: `expo/fetch` (NOT native fetch) is required in ChatContext for mobile SSE
- Tab layout: tries `isLiquidGlassAvailable()` from `expo-glass-effect` for NativeTabs (iOS 26), falls back to ClassicTabLayout with BlurView
- `setBaseUrl` called in `app/_layout.tsx` using `EXPO_PUBLIC_DOMAIN` env var

**Why:** expo/fetch is needed for SSE streaming on React Native; native fetch doesn't support readable streams on mobile.

## Routes
- `/(tabs)/index` — Home
- `/(tabs)/search` — Medicine/pharmacy search with category filter
- `/(tabs)/chat` — AI chat
- `/(tabs)/reminders` — Medication reminders (AsyncStorage)
- `/(tabs)/profile` — User profile + medical info
- `/medicine/[id]` — Detail + pharmacy availability
- `/pharmacy/[id]` — Detail + call + favorite
- `/emergency` — Emergency contacts + 24h pharmacy

## Data
Mock data in `data/mockData.ts`: 8 African medicines, 6 Nairobi pharmacies, availability map, categories, quick chat suggestions.

## App icon
`./assets/images/icon_2.png` (not `icon.png`) — referenced in `app.json`.
