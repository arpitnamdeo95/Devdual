# Add SpacetimeDB‑backed features to DevDuel

## Goal
Implement five new capabilities using SpacetimeDB while preserving the existing Socket.io flow and ensuring the Vercel deployment continues to work unchanged.

| Feature | Core tables & reducers | UI page / component | Integration point with existing code |
|---|---|---|---|
| **Achievements / Badges** | `Badge`, `UserBadge`; reducer `grantBadge(userId, badgeId)` | `src/pages/Achievements.tsx` (badge grid) | Call `grantBadge` from match‑end logic (Socket.io) |
| **Live Game Statistics Dashboard** | `GameStat`; reducer `recordStat(statId, value)` | `src/pages/Dashboard.tsx` (cards) | Periodic stats reporter (Node script or server‑side) pushes to SpacetimeDB |
| **Match History / Replay Archive** | `MatchLog`; reducers `startMatch`, `appendLog`, `endMatch` | `src/pages/MatchHistory.tsx` (replay player) | On each `code‑update` debounce → `appendLog`; on match end → `endMatch` |
| **User Profiles & Stats** | `User`; reducers `createOrUpdateUser`, `incrementStat` | `src/pages/Profile.tsx` | On login/create call `createOrUpdateUser`; after each match call `incrementStat` |
| **Persistent Leaderboard** | `LeaderboardEntry`; reducer `updateLeaderboard` | `src/pages/Leaderboard.tsx` | After each match call `updateLeaderboard` with new ELO |

## Architecture Overview
- **SpacetimeDB server module** lives in `spacetimedb/src/module.ts`. It contains all tables/reducers listed above.
- **Client SDK** (`spacetimedb` npm package) is added as a dependency. The generated TypeScript bindings are placed in `src/module_bindings/`.
- **React Provider** – wrap the whole app with `<SpacetimeDBProvider>` (see `src/spacetimeProvider.tsx`). This is a pure client‑side component; no server‑side code is introduced, so Vercel static hosting remains untouched.
- **Socket.io** continues to handle low‑latency code sync. Where persistence is needed, the Socket.io handlers will invoke the appropriate SpacetimeDB reducers.
- **Vercel Compatibility**
  - No new server‑side endpoints are added; all SpacetimeDB calls happen from the browser.
  - Add a Vercel environment variable `NEXT_PUBLIC_SPACETIME_URL` (or `VITE_SPACETIME_URL`) that points to the hosted SpacetimeDB instance.
  - Ensure the build script (`npm run build`) does not import any Node‑only APIs from the SpacetimeDB module – the SDK is fully browser compatible.
  - Update `vercel.json` (if present) to exclude the `spacetimedb/` folder from the build output; only the generated bindings are bundled.

## Step‑by‑Step Implementation Plan
1. **Install SDK** – `npm i spacetimedb`.
2. **Initialize SpacetimeDB module** – run `spacetime dev --template react-ts` which creates `spacetimedb/` and generates bindings.
3. **Add tables & reducers** – edit `spacetimedb/src/module.ts` with the definitions from the table above.
4. **Generate bindings** – `spacetime generate` (creates `src/module_bindings/`).
5. **Create Provider** – `src/spacetimeProvider.tsx` that builds the connection using the env var.
6. **Wrap App** – modify `src/App.tsx` to include `<SpacetimeDBProvider>` around the router.
7. **Add routes** for the five new pages.
8. **Implement UI pages** using the existing Tailwind theme (gradient buttons, glass panels, etc.). Each page will use `useTable`/`useReducer` hooks from `spacetimedb/react`.
9. **Wire reducers into existing Socket.io flow** – e.g., in `src/pages/BattleArena.tsx` after a match ends, call `connection.reducers.updateLeaderboard(...)` and `connection.reducers.grantBadge(...)`.
10. **Add periodic stats reporter** – a tiny Node script (or extend the existing server) that every 5 s calls `recordStat` with current player count, avg RTT, matches/min.
11. **Vercel adjustments** –
    - Add `VITE_SPACETIME_URL` env var in Vercel dashboard.
    - Ensure `vercel.json` includes:
      ```json
      {
        "build": {"env": {"VITE_SPACETIME_URL": "@spacetime_url"}},
        "ignore": ["spacetimedb/**"]
      }
      ```
    - Verify that the production build (`npm run build`) succeeds without referencing any local `spacetimedb/dev` binaries.
12. **Testing** – run locally (`npm run dev`) and verify each new page updates in real time. Then push to `anvikshaui` and let Vercel deploy; confirm the site loads and the new features work.

## Verification Plan
- **Automated**: run a small script that calls each reducer via the generated bindings and asserts the expected table rows exist.
- **Manual**: create two test accounts, play a match, and check:
  - Leaderboard updates instantly.
  - Profile shows updated stats.
  - Badges appear after the first win.
  - Dashboard numbers change as players join/leave.
  - Replay page shows the full code‑edit timeline.
- **Vercel**: after pushing, open the deployed URL, open the Network tab, ensure no 500 errors from missing env vars.

## Open Questions (need your input)
- **Badge catalog** – provide a list of badge IDs/names you want to start with (or we can seed a default set).
- **Stat list** – which live stats are most valuable for the dashboard?
- **Replay storage** – prefer a single JSON string per match or a separate `LogEntry` table for finer granularity?
- **Auth mapping** – does your JWT payload expose a stable `userId` that can be used as the SpacetimeDB `Identity`? Confirm the field name.
- **Vercel env var name** – do you already have a `NEXT_PUBLIC_` prefix in the project? If not, we’ll use `VITE_SPACETIME_URL`.

Please review the plan and answer the open questions so we can proceed with implementation.
