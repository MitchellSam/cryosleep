# Rules gaps

Open questions from the [RULES.md](RULES.md) capture, with the ruling the engine currently adopts.
Each one needs confirming against the official FAQ or errata before the milestone that implements
it. Resolved entries stay here with their answer so the reasoning is not lost.

Format: **Gap** — what is unclear · *Ruling* — what we implemented · *Blocks* — the milestone that
must settle it.

---

## Open

**G1. Card-level content is not in the rulebook.** The rulebook describes systems; the 10 Action
cards per role, 20 Event cards, 20 Bioform Attack cards, 16 Serious Wounds, 27 Contamination cards,
90 Items, 12 Quest Items, 18 Objectives and 8 Weaknesses are printed on the components. Their exact
distributions have to be sourced separately.
*Ruling:* none yet — this is the single largest fidelity risk in the project.
*Blocks:* M4 (Action decks), M5 (Attack/Wound decks), M7 (Items), M8 (Events), M9 (Objectives).

**G2. The board topology.** The Room slots, their numbering (001-021), the noise numbering of each
room's exits, Technical Corridor entrances and the Escape Pod sections are printed on the board.
*Status:* **the board is legible** — rulebook page 9 ("Board description") renders cleanly at high
DPI, and the slot ids, Corridor Numbers and technical-corridor entrances can be read off it. What
remains is careful transcription, slot by slot, plus a verification pass because the Corridor Numbers
are small and 3/8/0 are easy to confuse.
*Note:* room *tiles* are shuffled onto the slots at setup (RULES.md §2), so the fixed data is the
**slot graph**; which room sits on which slot is per-game and hidden until revealed.
*Blocks:* M2.

**G2a. Corridor Numbers are per-room, not per-corridor.** The board prints a **Corridor Number**
badge at each corridor mouth (the rulebook's board description, item 15). Reading them closely: a
room distributes the four noise results across its own exits, and where it has fewer than four
exits a single mouth carries **two** numbers — the legend inset on page 9 shows a "3"/"1" pair and a
"3"/"4" pair, and slot 002 shows a stacked "1"/"2" beside its Technical Corridor entrance. So the
mapping is many-to-one, and a corridor between rooms A and B may be reached by a different number
from each side.
*Ruling:* model it as `room → { 1|2|3|4 → destination }`, where a destination is a neighbouring room
or the Technical Corridors. M1's stub, which gave each corridor a single global number, is wrong and
is replaced in M2.
*Blocks:* M2. **Verify against the physical board before building on it.**

**G3. Noise die face distribution.** The rulebook names the results — 1, 2, 3, 4, Danger, Silence —
but never states how many of a d10's ten faces carry each. Searched: the official FAQ (v2.1), the
published rules summaries, BGG and the component listings. **None of them document it.** The
distribution is legible only on the physical dice.
*Ruling:* the distribution stays a named constant in content; every noise test asserts against the
constant rather than against literal probabilities, so filling it in later changes one table.
*Needs:* the ten faces of a **Noise die** (d10) tallied — how many show 1, 2, 3, 4, Danger, Silence.
*Blocks:* M2.

**G4. Combat die face distribution.** Same problem, and same search result: nothing published. The
five results are confirmed (miss / hit-vs-Larva-or-Creeper / hit-vs-Larva-Creeper-or-Adult / 1 hit /
2 hits), so at least one repeats across a d6's six faces.
*Ruling:* same approach — a named constant.
*Needs:* the six faces of an **Attack die** (d6, called the Combat die in the rules text) tallied —
how many show miss, hit-vs-Larva-or-Creeper, hit-vs-Larva-Creeper-or-Adult, 1 hit, 2 hits.
*Blocks:* M5.

**G5. Which Rooms are which colour, and which hold Computers.** Search draws from the deck matching
the Room's colour; white Rooms are player's choice. The mapping is printed on the tiles.
*Ruling:* deferred with G2.
*Blocks:* M7.

**G6. "Player X's character cannot survive" with a dead player.** An Objective naming a player whose
character has already died is trivially satisfied, but it is not stated whether such Objectives are
re-dealt or simply free.
*Ruling:* free — the requirement is that they are not alive at the end, and they are not.
*Blocks:* M9.

**G7. Simultaneous Escape-Pod launch and the passing rule.** A player waiting in a Pod
"automatically passes". It is not stated whether they still draw to 5 at the start of the next
Player Phase.
*Ruling:* yes — the draw step is unconditional for every player still in the game.
*Blocks:* M9.

**G8. Surprise Attack hand-size comparison.** The Encounter text says to compare the token number to
"the number of cards in the player's hand (Action and Contamination cards are counted)", then in the
next sentence says "if the number of **Action** cards is lower". The worked example counts three
cards including Contamination.
*Ruling:* count **all** cards in hand, Contamination included, per the first sentence and the
example.
*Blocks:* M3.

**G9. Whether a Bioform arriving by Noise-roll Danger triggers a Surprise Attack.** Danger *moves*
an existing Bioform rather than drawing from the bag, and §8.1 says movement into an occupied Room
is not an Encounter — but the mover arrives where the noise was made, which is where the crew are.
*Ruling:* no Encounter and no Surprise Attack; it becomes plain Combat, resolved in the next Event
Phase attack step.
*Blocks:* M3.

## Resolved

**R5. Track lengths and their coloured spaces.** Read off the board (rulebook page 9):

- **Time Track** — 15 spaces, counting *down* 15 → 1, then a final red hyperjump space. The marker
  starts on 15 (green). Spaces **8 down to 1 are blue**, so the hibernation chambers open when the
  marker reaches 8. Reaching the red space ends the game with the jump.
- **Self-Destruct Track** — 6 spaces, counting down 6 → 1, then a final skull space. Starts on 6
  (green). Spaces **3, 2 and 1 are yellow**, so the sequence becomes unstoppable and all Escape Pods
  unlock when the marker reaches 3. Reaching the skull destroys the ship.

**R1. Are Items public?** *Answer:* partly. Normal Items sit in a hidden Inventory where others see
the card backs and their colour but not the card; using one reveals it. Heavy Items and Objects are
always public and occupy 1 of 2 Hand slots. (Rulebook §"Character hands and inventory".)

**R2. Are Wounds public?** *Answer:* yes, fully. Light Wounds are markers on the character board;
Serious Wound cards sit face up beside it, and a Dressed one is flipped but still visible and still
counts toward the limit of 3.

**R3. Does a player know their own contamination?** *Answer:* no. INFECTED status is hidden from the
owner too until Scanned. The owner knows only that the card is Contamination.

**R4. How many Objectives does a player hold?** *Answer:* two — 1 Corporate, 1 Personal, both secret
— until the first Bioform appears on the board, at which point every player simultaneously keeps one
and removes the other from the game face down, unseen by anyone.
