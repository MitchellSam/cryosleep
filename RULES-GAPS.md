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

**G2. The corridor graph and room-tile faces.** The board's Room slots, Corridor numbering,
Technical Corridor entrances and the colour of each Room are printed on the board, not in the
rulebook text.
*Ruling:* M1 ships a stub graph. The real graph must be transcribed from a board photograph or
diagram before M2's exploration rules mean anything.
*Blocks:* M2.

**G3. Noise die face distribution.** The rulebook names the results — 1, 2, 3, 4, Danger, Silence —
but the count of each face on the d10 is not stated in the text we captured.
*Ruling:* assume the six results are not uniform and leave the distribution as a named constant to
be filled in. Every noise test is written against the constant, not against literal probabilities.
*Blocks:* M2.

**G4. Combat die face distribution.** Same problem: five named results on a d6, distribution not
given in the captured text.
*Ruling:* same approach — a named constant.
*Blocks:* M5.

**G5. Which Rooms are which colour, and which hold Computers.** Search draws from the deck matching
the Room's colour; white Rooms are player's choice. The mapping is printed on the tiles.
*Ruling:* deferred with G2.
*Blocks:* M7.

**G6. Time Track and Self-Destruct Track lengths.** The rules reference green, blue, yellow and red
spaces and their triggers, but not how many spaces each track has.
*Ruling:* deferred; tracks are data, not logic, so the engine reads their shape from content.
*Blocks:* M8.

**G7. "Player X's character cannot survive" with a dead player.** An Objective naming a player whose
character has already died is trivially satisfied, but it is not stated whether such Objectives are
re-dealt or simply free.
*Ruling:* free — the requirement is that they are not alive at the end, and they are not.
*Blocks:* M9.

**G8. Simultaneous Escape-Pod launch and the passing rule.** A player waiting in a Pod
"automatically passes". It is not stated whether they still draw to 5 at the start of the next
Player Phase.
*Ruling:* yes — the draw step is unconditional for every player still in the game.
*Blocks:* M9.

**G9. Surprise Attack hand-size comparison.** The Encounter text says to compare the token number to
"the number of cards in the player's hand (Action and Contamination cards are counted)", then in the
next sentence says "if the number of **Action** cards is lower". The worked example counts three
cards including Contamination.
*Ruling:* count **all** cards in hand, Contamination included, per the first sentence and the
example.
*Blocks:* M3.

**G10. Whether a Bioform arriving by Noise-roll Danger triggers a Surprise Attack.** Danger *moves*
an existing Bioform rather than drawing from the bag, and §8.1 says movement into an occupied Room
is not an Encounter — but the mover arrives where the noise was made, which is where the crew are.
*Ruling:* no Encounter and no Surprise Attack; it becomes plain Combat, resolved in the next Event
Phase attack step.
*Blocks:* M3.

## Resolved

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
