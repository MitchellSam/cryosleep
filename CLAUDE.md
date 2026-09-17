# CLAUDE.md

## Project

Cryosleep — a semi-cooperative online survival-horror board game for 2–5 players, in the vein of
Nemesis (Awaken Realms), rebuilt as an **original-fiction reskin**: the mechanical skeleton is
reimplemented, none of the published text, names, or art is. Crew are identified by **role only**
(scout, mechanic, soldier, scientist, pilot, captain, doctor) — never by a personal name. Every
player plays on their own computer, from wherever they are — there is no shared board screen and no
phone-controller layer. Voice happens outside the app (Discord).

**Desktop browser only.** One dense screen at laptop size and up; no responsive/mobile work.

Type: static (Vite client on GitHub Pages) + a socket.io server on Render. Spec lives in SPEC.md —
it is the source of truth for scope and the definition of done.

## Hard rules

- **Secrecy is a typed boundary.** The authoritative `GameState` never leaves the server. Clients
  receive only a `PlayerView` from the single `projectFor(playerId, state)` projection in
  `packages/shared`. Objectives, other players' hands, deck order, bag contents, unexplored tiles
  and contamination live behind it. Any new secret field must be covered by the redaction test or
  CI fails. This is an anti-cheat boundary (a player can open devtools), *not* a UI-concealment
  one — a player's own secrets are shown plainly on their own screen, since nobody is screensharing.
- **Faithful rules, original text.** The rules match the published base game exactly — numbers,
  effects, structure, edge cases. `RULES.md` is that spec in our own words, sourced from the
  official rulebook; the engine implements `RULES.md`, and a rules question is answered by checking
  the rulebook, not by inventing a ruling. What we replace is *naming and flavour only*: ship,
  room, creature, item, event and objective names and descriptive text are written fresh.
- **No rules in the UI.** All rules, effect and config text comes from the engine/content data
  (`packages/shared/src/content/`), never hardcoded in `apps/web`.
- **The engine is pure.** No I/O, no `Math.random` — seeded RNG lives in state, so games are
  deterministic and replayable.

## Pipeline

This repo is wired into the AI dev pipeline (see ~/Code/PIPELINE.md):

- All work happens on milestone branches and merges to `main` via PR.
- CI (`ci.yml`) must be green; PRs auto-merge (`gh pr merge --auto --squash`) once CI passes and the
  Claude Review comment is not a `VERDICT: BLOCK`.
- Never push directly to `main`. Never commit `.env`/secrets (a global hook also blocks this).
- Merges to `main` deploy the client to GitHub Pages automatically; the server auto-deploys on
  Render from `render.yaml`.

## Commands

- `npm run dev:web` / `npm run dev:server` — local dev (5173 / 3001)
- `npm test` — tests (Vitest, all workspaces)
- `npm run lint` / `npm run typecheck` / `npm run build`
