# Cryosleep — Spec

Status: APPROVED          <!-- DRAFT | APPROVED; /build refuses to run on DRAFT -->

## Overview

A semi-cooperative online survival-horror board game in the vein of *Nemesis* (Awaken Realms),
rebuilt as an original-fiction reskin: the base game's rules reproduced faithfully, with our own
names, flavour and art direction in place of its text.
Two to five players wake from cryosleep aboard a crippled deep-space hauler with something loose in
the vents. Everyone is trying to survive; each player also holds a **secret objective**, and some of
those objectives require the ship to burn or a specific crewmate not to make it home.

Unlike [zero-patients/](../zero-patients/), there is no shared board screen: every player plays on
their own device with their own full view of the ship, and the server decides what each of them is
allowed to see. Characters are identified by **role only** — Captain, Pilot, Scientist, Scout,
Soldier, Mechanic — never by personal name.

## Definition of Done

1. Client live at `https://mitchellsam.github.io/cryosleep/` and loading into the lobby.
2. Socket server live on Render free tier, reachable from that client (create-room round-trips).
3. All milestones merged to `main`, CI green on `main`.
4. `npm test` covers the full rules engine; the hidden-information leak test (M9) passes in CI.
5. A complete 3-player game — cryosleep → exploration → intruders → escape/destruction → objective
   reveal — played end to end on three separate devices, with at least one game won by a betrayal
   objective. This is a human gate; /ship reports it as the last checklist item.

## Non-goals (v1)

- **Solo / AI-driven play.** No bot crew, no bot opponents. Multiplayer only, 2–5 humans.
- **Expansion content.** Base game only — no Aftermath, Void Seeders, Carnomorphs analogues.
- **Accounts, matchmaking, persistence across sessions.** Room codes, in-memory rooms, one node.
- **Art.** Functional SVG/CSS ship map and card layouts. No illustration pass; no audio.
- **Spectators, replays, tournament tooling.**
- **Mobile and tablet.** Desktop browser only — the UI is a single dense screen sized for a laptop
  or larger. No responsive breakpoints, no touch targets, no phone layout.
- **A balance-tuning sim harness** (see Follow-ups).

## Legal note

Game mechanics and systems are not copyrightable; specific text, names, characters, and art are.
Every card title, ability line, room name, creature name, event, and objective in this project is
written fresh for our own fiction. No scanned or transcribed component text enters the repo. The
README credits *Nemesis* as the inspiration and states clearly that this is an unofficial,
non-commercial original-fiction reimplementation.

## Tech

| Choice | Reason |
|---|---|
| TypeScript strict, npm workspaces monorepo | Same shape as zero-patients — proven here, zero ramp-up. |
| `packages/shared` — zod schemas for protocol + content data | One source of truth for wire types, validated at the socket edge. |
| `packages/engine` — pure `applyAction(state, playerId, action) → {state, events}` | No I/O, seeded RNG held *in state* → deterministic, replayable, unit-testable. |
| `apps/server` — Node 22 + socket.io + tsx | Authoritative referee; rooms by 4-letter code; reconnect tokens. Mirrors zero-patients' server so Render deploy is copy-paste. |
| `apps/web` — Vite + React 19 + zustand + react-router | Static client, deployable to GitHub Pages; `base: '/cryosleep/'`. |
| vitest | Engine suite + protocol contract tests. |
| Per-player **view projection** in `shared` (`projectFor(playerId, state)`) | Secrecy is a typed boundary, not a convention — the only way state reaches a client. |
| GitHub Pages (client) + Render free tier (server), `render.yaml` blueprint | Same split and cost as zero-patients: $0. |

**Hidden-information rule (architectural, enforced from M1):** the full `GameState` never leaves the
server. Clients receive only `PlayerView`, produced by a single projection function. Objectives,
other players' hands, deck order, bag contents, unexplored room tiles, and contamination status live
behind it. Any new secret state must be added to the projection's redaction test or CI fails.

## Content and rules capture

**Fidelity is the standard: the rules match the published game.** M1 produces `RULES.md` — a
complete, our-own-words specification of the base-game rules, derived from the official Awaken
Realms rulebook (`https://cdn.1j1ju.com/medias/7a/6e/2f-nemesis-rulebook.pdf`, 28pp, base game) and
the official FAQ. Round structure, action costs, the noise table, bag composition, damage values,
deck sizes, wound and contamination rules are reproduced exactly, not approximated. `RULES-GAPS.md`
holds the ambiguities and the ruling we adopted for each, with a source line.

The rulebook PDF itself is a reference, not a repo artifact — it is not committed.

### Naming policy

Players who know the original should recognise this game immediately. Recognition comes from the
mechanics — the token bag, the noise roll, two actions, contamination — not from proper nouns, so
we keep the vocabulary that is generic English or generic sci-fi and rewrite only what the
publisher actually coined.

**Keep verbatim** — generic terms, not the publisher's inventions, many of them older than the
game (it is itself an Alien homage):

- Rooms: Cockpit, Engine Room, Laboratory, Generator, Airlock, Bridge, Surgery, Storage, Armory,
  Control Room, Escape Pods, Nest.
- Creature life stages and tokens: Larva, Adult, Queen, Egg, Creeper, Breeder — biological nouns.
- Character roles: captain, pilot, scientist, scout, soldier, mechanic — occupational nouns, and the
  published game's six classes exactly. (An earlier draft of this spec listed seven, inventing a
  doctor; fidelity wins — there are six.)
- Common item and system words: flamethrower, medkit, grenade, coordinates, hull breach, self-destruct.
- Every number, effect, cost, probability and structural rule: **identical to the published game.**

**Rename** — actual coinages, or words that function as the game's identity:

- `Hibernatorium` → our own term for the cryo bay.
- `Intruder` as the species proper noun → our own creature name. This is the single most
  identifying word in the original; the life-stage nouns above stay.
- Every card *title*: events, serious wounds, objectives, contamination, weaknesses.

**Never**: the original's title, logo, art, visual design, or its name anywhere in the repo, URL,
page title, or metadata. And **all card text is written fresh** — ability wording and flavour text
are the publisher's expression, and are the one thing never copied even in paraphrase-adjacent form.

The README carries an "unofficial, non-commercial, not affiliated" disclaimer. If the publisher ever
objects, we comply immediately — that, not the wording above, is the real protection.

All naming lives in `packages/shared/src/content/` as data, never hardcoded in the UI, so any of it
can be changed without touching the engine or the client.

Confirmed from the rulebook at spec time, because each one shapes the protocol:

- **Objectives:** each player is dealt **two** (1 Corporate + 1 Personal), both secret; at the first
  Intruder encounter they choose one and the other is removed from the game face down, unseen.
- **Items:** normal Items sit in a hidden Inventory — other players see the *card backs and their
  colour*, not the card. Using an Item reveals it to everyone. Heavy Items and Objects occupy the
  two Hand slots and can **never** be hidden.
- **Contamination:** a Contamination card's INFECTED status is hidden **from its owner too**, until
  scanned. The owner knows only that the card is contamination.
- **Wounds are public.** Light Wounds are markers on the character board; Serious Wound cards sit
  face up beside it (a Dressed one is flipped, effect ignored, still counting toward the limit of 3).

## Milestones

Each milestone is one PR, independently mergeable, with tests.

- [x] **M1: Walking skeleton + rules capture** — monorepo (`shared`/`engine`/`server`/`web`), CI,
      Pages + Render deploy live. Lobby: create/join by room code, pick a role, host starts. Ship
      state is a stub map; the single implemented action is `move`, resolved server-side and
      reflected on every connected client. `PlayerView` projection + redaction test exist from this
      commit. `RULES.md` + `RULES-GAPS.md` written and reviewed.
      *Acceptance:* two browsers join a room from the Pages URL, both see the map, one moves and both
      see it; CI green; `projectFor` test asserts a stub secret never appears in another player's view.

- [ ] **M2: Ship, exploration, noise** — full room graph and corridors, face-down room tiles revealed
      on entry, doors (open/closed/damaged), Move vs. careful move, the noise roll and noise markers,
      the encounter trigger (spawns a placeholder token for now). Seeded RNG through every roll.
      *Acceptance:* engine tests pin the noise/encounter table per seed; a client can explore the
      whole ship; identical seeds replay identically; **an unexplored room's identity reaches the
      client only through `PublicRoom` once revealed** — never as shipped content the client masks
      in the UI, which would put every tile face in the bundle.

- [ ] **M3: Intruders** — the token bag (types, counts, development/escalation), spawning from
      encounters and events, intruder movement toward noise, per-type stats and behaviour, surprise
      attacks, the weakness deck.
      *Acceptance:* seeded bag-draw and development tests; spawn/move rules covered; an intruder can
      find and reach a player across the map in a scripted test.

- [ ] **M4: Round structure and the action economy** — per-role action decks (role-unique cards mixed
      with the common set), hand draw/discard/exhaust, two actions per turn, passing, turn-order
      tokens, and the Player → Event → Cleanup round loop.
      *Acceptance:* a full scripted round runs in the engine with all five players; hands are private
      in the projection; the hand UI renders on each device.

- [ ] **M5: Combat, wounds, death** — the attack action, weapons and ammunition, intruder attack decks
      and retaliation, light and serious wounds, the wound deck, death and what it leaves behind
      (corpse, dropped items, cards out of play).
      *Acceptance:* combat resolution incl. retaliation and death thresholds covered by tests; a
      player can be killed by an intruder and the table sees the correct public result.

- [ ] **M6: Contamination and infection** — contamination cards polluting the action deck, their
      sources, scanning/analysis room actions, infection development, the chest-larva timer and death,
      cures and removal.
      *Acceptance:* engine tests for each contamination source and for infection progression; a
      player's own contamination status is visible to them and hidden from others per `RULES.md`.

- [ ] **M7: Items, search, crafting, room actions** — per-room search decks, item cards and their
      effects, crafting recipes and components, powered room actions.
      *Acceptance:* every item and recipe in `RULES.md` has a test; the client can search, craft, and
      use a room action end to end.

- [ ] **M8: Ship systems, events, the clock** — engines, cockpit/course, fire, malfunctions, hull
      breach, self-destruct sequence, the round track and the arrival deadline, and the event deck
      driving all of it.
      *Acceptance:* each event card has a test; a scripted game reaches both "ship lands" and "ship
      destroyed" states.

- [ ] **M9: Objectives, escape, adjudication** — the secret objective deck (survival, corporate, and
      betrayal objectives), escape pods and their capacity/launch rules, returning to cryosleep,
      end-of-game per-player win/lose adjudication, and the full-table objective reveal.
      *Acceptance:* every objective type has a test; a game is playable start to finish to a result;
      the CI **leak audit** fuzzes `projectFor` over generated states and asserts no objective, hand,
      deck order, bag content, or unrevealed tile appears in a view that shouldn't hold it.

- [ ] **M10: Client pass** — reconnect after refresh/disconnect, in-game log of public events,
      end-of-game reveal screen, legality-aware action affordances, keyboard shortcuts for the
      common actions, and the README/PIPELINE updates.
      *Acceptance:* a refreshed browser rejoins mid-game with correct private state; the whole game
      state is readable without scrolling at 1440×900; docs match the implementation.

## Follow-ups after v1

- Headless sim harness + scripted agents (card-battler's `packages/sim` model) for balance verdicts.
- Solo mode against engine-driven intruders.
- Art and audio pass; animations.
- Redis-backed rooms for multi-node.
