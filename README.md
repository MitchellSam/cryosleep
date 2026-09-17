# Cryosleep

A semi-cooperative online survival-horror board game for 2–5 players. You wake from cryosleep on a
crippled deep-space hauler with something loose in the vents. Everyone wants to get home; each of
you also holds a secret objective, and not all of them are compatible with the rest of the crew
surviving.

Unofficial, non-commercial, and **not affiliated with anyone**. It is an original-fiction
reimplementation inspired by the tabletop game *Nemesis* (Awaken Realms) — the systems are
reimplemented from scratch and every card, room, creature and objective is written fresh for our
own setting. Crew are identified by role, never by name.

**Play it:** https://mitchellsam.github.io/cryosleep/ *(once M1 ships)* — each player opens it in a
desktop browser, wherever they are, and joins with a room code. Bring your own voice chat. The
server runs on Render's free tier and sleeps when idle, so the first game of a session takes
~30–60s to start while it wakes.

## Architecture

Pure game engine, authoritative server, thin clients — no client ever holds another player's
secrets.

```
packages/
├── shared/    # wire protocol (zod), content data, and the PlayerView projection —
│              # the only path by which state reaches a client
└── engine/    # the rules: a pure reducer over GameState. No I/O, seeded RNG
               # in-state → deterministic and replayable.
apps/
├── server/    # socket.io: rooms, reconnect tokens, action routing, per-player views
│              # npm run dev:server (PORT=3001)
└── web/       # Vite + React: lobby + per-player ship view (desktop only)
               # npm run dev:web (5173, VITE_SERVER_URL to point elsewhere)
```

## Development

```sh
npm install
npm test
npm run typecheck
npm run lint
```

## Rules

[RULES.md](RULES.md) is the specification the engine implements — the published game's rules in our
own words, reproduced faithfully. [RULES-GAPS.md](RULES-GAPS.md) tracks what is still unresolved and
the ruling we adopted meanwhile. A rules question is answered by checking RULES.md, and RULES.md is
answered by checking the rulebook — never by inventing a ruling.

## Status

**M1 — walking skeleton, done.** Lobby (create/join by 4-letter code, pick one of six roles, host
starts), a stub ship graph, the `move` and `pass` actions resolved server-side, per-player views,
and reconnect after a refresh. The `PlayerView` projection and its redaction tests are in from this
commit.

Next: M2 (the real room graph, exploration, noise). See [SPEC.md](SPEC.md) for the full plan.
