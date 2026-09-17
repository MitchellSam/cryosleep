# Cryosleep

A semi-cooperative online survival-horror board game for 2–5 players. You wake from cryosleep on a
crippled deep-space hauler with something loose in the vents. Everyone wants to get home; each of
you also holds a secret objective, and not all of them are compatible with the rest of the crew
surviving.

Unofficial, non-commercial, and **not affiliated with anyone**. It is an original-fiction
reimplementation inspired by the tabletop game *Nemesis* (Awaken Realms) — the systems are
reimplemented from scratch and every card, room, creature and objective is written fresh for our
own setting. Crew are identified by role, never by name.

**Play it:** https://mitchellsam.github.io/cryosleep/ *(once M1 ships)* — each player opens it on
their own device and joins with a room code. The server runs on Render's free tier and sleeps when
idle, so the first game of a session takes ~30–60s to start while it wakes.

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
└── web/       # Vite + React: lobby + per-player ship view
               # npm run dev:web (5173, VITE_SERVER_URL to point elsewhere)
```

## Development

```sh
npm install
npm test
npm run typecheck
npm run lint
```

## Status

Scaffolded. See [SPEC.md](SPEC.md) for the approved milestone plan; M1 (walking skeleton + rules
capture) is next.
