# Cryosleep — Rules

The complete rules the engine implements, written in our own words. **Fidelity is the standard**:
every number, cost, probability and edge case here matches the tabletop game this project
reimplements, sourced from its official base-game rulebook. Where this document and the engine
disagree, this document is right and the engine has a bug. Where this document is silent or
ambiguous, see [RULES-GAPS.md](RULES-GAPS.md).

Naming follows the policy in [SPEC.md](SPEC.md): generic vocabulary is kept so the game reads
familiarly, and the two coinages are replaced — the cryo bay is the **Cryobay**, and the creatures
are **Bioforms** (the designation the ship's AI assigns them). The ship is the hauler *Meridian*.

---

## 1. Overview

2–5 players. Each player controls one crew member, identified by role. Everyone wants to get home;
each player also holds a secret Objective, and some Objectives require other crew to die or the ship
to be destroyed. A player wins by **completing their Objective and surviving** — nothing else, and
another player winning does not cost you anything.

## 2. Setup

1. Place the ship board. Eleven **Basic Rooms** (back "1") are in every game; five **Additional
   Rooms** (back "2") are drawn at random from nine. All are placed face down on their slots.
2. Place one face-down **Exploration token** on each Room tile.
3. Place one random face-down **Coordinates card** beside the Cockpit.
4. Place the **Destination marker** on space "B" of the Destination Track.
5. **Escape Pods** by player count: 1–2 players → 2 pods, 3–4 → 3 pods, 5 → 4 pods. Deal them
   alternating between Section A and Section B, lowest number first, all **Locked** side up.
6. For each of the three Engines, shuffle its two tokens (1 Working, 1 Damaged) face down and stack
   them on the Engine slot. **The top token is the Engine's true status**, and nobody has seen it.
7. On the Bioform board: 5 **Egg** tokens, and 3 random face-down **Weakness** cards (one each for
   Crew Corpse, Egg, and Carcass).
8. **Bioform bag** starts with: 1 Blank, 4 Larvae, 1 Creeper, 1 Queen, 3 Adults, **plus 1 additional
   Adult per player**.
9. Shuffle and place face down: three Item decks (Red/military, Yellow/technical, Green/medical),
   the Event deck, the Bioform Attack deck, the Contamination deck, and the Serious Wound deck. The
   Crafted (Blue) Item deck is a supply, not a draw deck.
10. Place the Time marker on the green space of the Time Track.
11. Deal each player a Player Number. Deal each player **one Corporate and one Personal Objective**,
    both secret.
12. Character draft: in Player Number order, each player is dealt 2 random role cards, reveals them,
    keeps 1, and shuffles the other back.
13. Each player takes their role's board, their 10-card Action deck (shuffled), their starting
    Weapon loaded to its Ammo capacity, and their 2 **Quest Items** (inactive, face down).
14. All crew start in the **Cryobay**. Player 1 takes the First Player token. Place the blue Crew
    Corpse token in the Cryobay — a body that was already there.

## 3. Turn structure

A turn is two phases: **Player Phase**, then **Event Phase**.

### 3.1 Player Phase

1. **Draw** — every player draws from their Action deck up to a hand of **5**. If a deck is empty at
   any point when a draw is required, shuffle that player's discard pile to form a new deck, then
   draw.
2. **First Player token** — passes one seat to the left. *Not on the first turn of the game.* All
   ordered procedures start with the First Player and proceed clockwise.
3. **Rounds** — starting with the First Player and going clockwise, each player takes a **round of 2
   Actions**. When everyone has taken a round (or passed), another series of rounds begins, and so
   on for as long as at least one player has not passed. When all players have passed, the phase
   ends.
   - A player who cannot or will not act must pass.
   - A player who takes only 1 Action must pass.
   - A player who has passed takes no further Actions this phase.
   - On passing, a player may discard any number of cards from hand.
   - A crew member who **ends their round** in a Room with a Fire marker suffers 1 Light Wound. Once
     per round only — a player who has passed takes no further Fire damage that turn.

### 3.2 Event Phase

4. **Time** — advance the Time marker 1 space. If the Self-Destruct sequence is active, advance that
   marker 1 space too.
5. **Bioform attacks** — every Bioform in Combat with a crew member attacks (§8).
6. **Fire damage** — every Bioform in a Room with a Fire marker suffers 1 Injury. Fire in a Room
   holding uncarried Eggs destroys 1 uncarried Egg.
7. **Event card** — draw 1 and resolve in order:
   - *Bioform movement*: every Bioform matching a symbol on the card **and not in a Room with any
     crew** moves through the Corridor bearing the card's number. A Bioform moving into a Technical
     Corridor entrance is removed from the board, its Injuries discarded, and its token returned to
     the bag.
   - *Event effect*: as printed.
   Discard the card. If the Event deck empties, reshuffle its discard pile into a new deck.
8. **Bag development** — draw 1 token from the Bioform bag:
   - **Larva** → remove this token from the bag, add 1 Adult token to the bag.
   - **Creeper** → remove this token from the bag, add 1 Breeder token to the bag.
   - **Adult** → every player rolls for Noise in order, *except* players whose crew member is in
     Combat. Return the token to the bag.
   - **Breeder** → as Adult. Return the token to the bag.
   - **Queen** → if any crew are in the Nest, place the Queen there and resolve an Encounter.
     Otherwise (including a Nest not yet discovered) add 1 Egg token to the Bioform board. Return
     the token to the bag.
   - **Blank** → add 1 Adult token to the bag (nothing if none remain). Return the Blank to the bag.
9. **End of turn** — the turn ends only once every Encounter and Surprise Attack triggered above has
   fully resolved.

## 4. Movement and exploration

Crew and Bioforms occupy **Rooms** only. **Corridors** connect Rooms and are never stopped in.
Corridor effects resolve *after* the move into the Room.

**Movement** (Basic Action) — move to a Room connected by one Corridor. A Closed Door breaks that
connection for crew. On entering:

1. If the Room tile was face down, flip it and reveal its Exploration token.
2. If the Room is **empty** — no crew, no Bioforms — make a **Noise roll**. If anyone is already
   there, crew or Bioform, no Noise roll.

To move out of a Room containing a Bioform, use the **Escape** rule (§8.4).

**Careful Movement** (Basic Action) — as Movement, but instead of a Noise roll, place a Noise marker
in a Corridor of your choice connected to the Room you enter. Not available if every connected
Corridor already holds a Noise marker, and not available while in Combat.

### 4.1 Exploration tokens

A token sets the Room's **Item Counter** (rotate the tile so the number faces the counter symbol —
this is exactly how many Items the Room yields) and then resolves one effect:

- **Silence** — nothing; no Noise roll for this move. *With a Slime marker, resolve Danger instead.*
- **Danger** — no Noise roll for this move. If a Bioform is in a neighbouring Room and not in Combat,
  move it here — all of them, if several qualify. If none qualify, place a Noise marker in every
  connected Corridor that lacks one.
- **Slime** — take a Slime marker.
- **Fire** — place a Fire marker here.
- **Malfunction** — place a Malfunction marker here.
- **Doors** — place a Door token in the Corridor you entered through.

Remove the token afterwards. The Nest and the Room Covered With Slime do not get an Item Counter.

### 4.2 Noise roll

Roll the Noise die:

- **1, 2, 3 or 4** — place a Noise marker in the connected Corridor with that number (a Technical
  Corridor entrance counts, and its marker goes on the shared Technical Corridors space). **A
  Corridor never holds more than one Noise marker: if told to place one where a marker already sits,
  resolve an Encounter instead.**
- **Danger** — if a Bioform sits in a neighbouring Room and is not in Combat, move it here (all
  eligible ones). Otherwise place a Noise marker in every connected Corridor that lacks one.
- **Silence** — nothing. *With a Slime marker, resolve Danger instead.*

### 4.3 Technical Corridors

Crew cannot enter them. Noise routed to any Technical Corridor entrance goes on the single shared
Technical Corridors space, which counts as present at every entrance on the board. Doors are never
placed there. A Bioform entering one vanishes into the ducts: discard its Injuries, return its token
to the bag, remove the model. A Noise marker on the Technical Corridors space stays.

## 5. Markers

- **Noise** — marks Corridors for the Noise rules. Nothing else.
- **Slime** — while a crew member has one, every Silence result (roll or Exploration token) becomes
  Danger. Maximum one at a time. Removed by Clothes or the Shower Room.
- **Fire** — (1) a crew member ending their round here suffers 1 Light Wound; (2) each Bioform here
  takes 1 Injury in the Fire Damage step; (3) **there are 8 markers — being told to place a 9th
  destroys the ship**. One per Room; a second does nothing. Room Actions and Search still work here.
- **Malfunction** — (1) disables that Room's Action (Search still works) and its Computer, including
  in Special Rooms; (2) **there are 8 — a 9th breaks the hull and everyone aboard dies**. One per
  Room. Never placed in the Nest or the Room Covered With Slime. Does not change an Engine's
  Working/Damaged status, and has no effect on already-hibernating crew.
- **Doors** — one per Corridor, three states. **Closed** blocks crew and Bioform movement (and
  thrown Grenades); a Bioform that tries to move through a Closed Door **destroys it instead of
  moving**. **Destroyed** allows movement and can never be closed again (except by a Plasma Torch).
  **Open** is simply no token — every Corridor starts open. If several Bioforms move from one Room
  through a Closed Door, they act simultaneously: the Door is destroyed and all of them stay put. A
  Bioform arriving via a Noise roll ignores Closed Doors.

## 6. Actions

Four sources: Basic Actions, Action cards, Item cards, Room Actions.

**Cost** — an Action's icon shows how many Action cards must be discarded from hand to pay for it.
For an Action card, that cost is **in addition to** the card itself. **Contamination cards cannot
pay costs** and provide no Actions, though they sit in hand like Action cards.

Actions may be marked **In Combat only** or **Out of Combat only**; unmarked Actions work either
way. A crew member is in Combat whenever a Bioform shares their Room. Eggs are not Bioforms.

### 6.1 Basic Actions

- **Movement** / **Careful Movement** — §4.
- **Shoot** — attack a Bioform in your Room with a Weapon in Hand holding at least 1 Ammo (§8.2).
- **Melee Attack** — attack a Bioform in your Room bare-handed (§8.3).
- **Pick up Heavy Object** — take 1 Heavy Object in your Room (Crew Corpse, Carcass, or Egg).
- **Trade** — with all crew in your Room. Participants may show each other whatever they like and
  exchange Items and Objects by mutual agreement, or give freely. Only the initiator spends the
  Action. **Ammo can never be traded.**
- **Craft Item** — §10.

### 6.2 Room Actions

Require being in the Room, **not being in Combat**, and no Malfunction marker. See §12.

## 7. Critical moments

- **First Encounter** — the moment the first Bioform of any type appears on the board, every player
  immediately chooses one of their two Objectives; the other is removed from the game face down,
  unseen by anyone. Then the triggering Encounter resolves. Eggs are not Bioforms and do not
  trigger this.
- **First death** — the first time any crew member dies, all Escape Pods unlock automatically. They
  can be locked and unlocked normally thereafter.
- **Hibernation opens** — when the Time marker reaches any blue space. Crew cannot hibernate before
  that.
- **Self-Destruct critical** — when the Self-Destruct marker reaches any yellow space, all Escape
  Pods unlock and the sequence can no longer be stopped.

## 8. Encounter and Combat

### 8.1 Encounter

An Encounter is a Bioform *appearing* in a Room holding crew — from a Noise roll, an Event, or a
Bioform Attack card. A Bioform simply *moving* into an occupied Room is not an Encounter, and
neither is crew entering a Room that already holds a Bioform; both of those are just Combat.

1. Discard every Noise marker from every Corridor connected to this Room (Technical Corridors
   included).
2. Draw 1 token from the Bioform bag.
3. Place the matching Bioform in the Room.
4. Compare the **number on the token's reverse** to the number of cards in the triggering player's
   hand (Contamination cards count). **Fewer cards than the number → Surprise Attack** (a Bioform
   Attack against that player, §8.5). Equal or more → nothing.

Set the drawn token aside; it returns to the bag if that Bioform later hides in the ducts.

**Blank token** — place a Noise marker in every Corridor connected to the Room. If the Blank was the
last token in the bag, add 1 Adult token to the bag. Return the Blank. The Encounter ends.

If told to place an Adult while all 8 models are already on the board, every Adult **not in Combat**
retreats — remove them and return their tokens to the bag — and then place an Adult in the
Encounter's Room.

### 8.2 Shoot

Choose a Weapon and a target in your Room, discard 1 Ammo, roll the Combat die:

| Result | Effect |
|---|---|
| Miss | nothing |
| 1 hit vs. small | 1 Injury if the target is a Larva or Creeper, else miss |
| 1 hit vs. medium | 1 Injury if the target is a Larva, Creeper or Adult, else miss |
| 1 hit | 1 Injury, any target |
| 2 hits | 2 Injuries, any target |

### 8.3 Melee Attack

Draw 1 Contamination card to your discard pile, choose a target, roll the Combat die. Same ladder as
Shoot, with two differences: **every miss also costs you 1 Serious Wound**, and the top result deals
**1** Injury, not 2.

### 8.4 Escape

Leaving a Room containing a Bioform by Movement: **resolve a Bioform Attack first** — one per
Bioform in the Room. Survive and you complete the move (exploring and rolling Noise as normal if the
destination is empty). Die and your Corpse stays in the Room you tried to leave.

### 8.5 Bioform Attack

Happens on a Surprise Attack, in the Event Phase attack step, and on an Escape.

1. **Target**: a crew member in the same Room. With several present, the Bioform attacks whoever has
   **the fewest cards in hand**; ties go to the First Player, then clockwise. A Surprise Attack
   targets whoever triggered the Encounter; an Escape targets the escaper.
2. Draw 1 **Bioform Attack card**. If its symbols include the attacking Bioform's type, resolve the
   effect; otherwise the attack misses. The card's "blood" value is ignored here.

Reshuffle the discard pile when the deck runs out.

**Infest** — a Larva's attack draws no card. Instead: remove the Larva model and place it on the
target's character board, and the target takes 1 Contamination card.

### 8.6 Injuries and death

Place Injury markers on the Bioform, then check:

- **Larva or Egg** — 1 Injury kills it.
- **Creeper or Adult** — draw 1 Bioform Attack card and read only its "blood" value. Value ≤ current
  Injuries → killed; leave a **Carcass** token in the Room. Value > Injuries → it survives.
- **Breeder or Queen** — draw **2** cards, sum their "blood" values, compare the same way.

Endurance is therefore unknown and variable — the crew never learn how much damage a kill takes.

**Retreat** — if any drawn card's blood icon shows the Retreat arrow, the Bioform flees: draw an
Event card, move it through the Corridor numbered in that card's movement section, discard the
Event. A Breeder or Queen retreats if **either** of its two cards shows the arrow.

## 9. Crew wounds, contamination, death

**Light Wounds** track 0 → 1 → 2. A third Light Wound clears the track and inflicts a **Serious
Wound** instead.

**Serious Wounds** are cards, drawn and kept face up beside the board, each with its own effect.
Duplicates do not stack, but are harder to clear. **A crew member with 3 Serious Wounds who suffers
any further Wound dies instantly.**

**Death** — remove the model, leave a Crew Corpse token in the Room, and drop all carried Heavy
Objects there.

**Dress** — flip a Serious Wound face down: its effect is ignored, but it still counts toward the
limit of 3. **Heal** — remove a Light Wound, or discard a Dressed Serious Wound.

### 9.1 Contamination

A Contamination card goes on top of its owner's Action discard pile. It clogs the hand: it is drawn
and held like an Action card but does nothing and cannot pay costs.

**Every Contamination card is secretly either INFECTED or not, and its owner does not know which**
until it is Scanned. Scanning reveals it. On revealing an INFECTED card: place a Larva on your
character board and **keep the card**. If a Larva is already there, **your crew member dies** and a
Creeper is placed in the Room where they died.

Removing a Contamination card removes it from the game.

## 10. Items, Objects, crafting

Items come from the starting Weapon, 2 role Quest Items (locked until their printed condition is
met), Searching, and Crafting.

**Inventory** — normal Items are kept hidden; other players see **the card backs and their colour**,
never the card, and there is no size limit. **Using an Item reveals it to everyone.**

**Hands** — Heavy Items (the Hand icon, e.g. Weapons) can **never** be hidden, and occupy 1 of 2
Hand slots. Heavy Objects (Crew Corpse, Carcass, Egg) take Hand slots too. Taking a third means
dropping one. Weapons found by Searching arrive with 1 Ammo and can never exceed their printed
capacity.

**Drop** — free, any time during your turn. Objects stay in the Room; Item cards are discarded.

**Search** — costs the Room's Item Counter 1 and yields Items matching the Room's colour; a white
Room lets you pick the deck. At 0 the Room is empty for good. Never available in the Nest, the Room
Covered With Slime, or any Special Room.

**Crafting** — discard 2 Item cards whose blue Component icons match a Crafted Item's two grey icons
to take that card from the supply: **Antidote, Taser, Flamethrower, Molotov Cocktail**. A Crafted
Item cannot be built if its card is already taken.

**Crew cannot attack each other.** Harm has to be indirect — a Room left on Fire, a Grenade thrown
where a crewmate stands, a Self-Destruct with people still aboard.

## 11. Weaknesses

Three face-down Weakness cards sit on the Bioform board, one each keyed to a Crew Corpse, an Egg,
and a Carcass. Researching the matching Object in the Laboratory reveals that card, and its effect
helps every player for the rest of the game.

## 12. Rooms

### Basic Rooms (all 11 in every game)

| Room | Action |
|---|---|
| **Armory** | Add 2 Ammo to one Energy Weapon (not Classic Weapons; never above capacity). |
| **Comms Room** | Send a Signal — place a marker on your Signal space. Required by some Objectives; no other use. |
| **Emergency Room** | Dress all your Serious Wounds, **or** Heal 1 Dressed Serious Wound, **or** Heal all Light Wounds. |
| **Evacuation Section A / B** | Try to board an Escape Pod in that Section (§13). |
| **Fire Control System** | Choose any Room: discard its Fire marker, and every Bioform there flees in a random direction (draw 1 Event card per Bioform). Works with no Fire present. |
| **Generator** | Start or stop the Self-Destruct sequence (§13). |
| **Laboratory** | Analyse 1 Crew Corpse, Carcass or Egg present in the Room to reveal its Weakness. The Object is not consumed. |
| **Nest** | Take 1 Egg from the Bioform board, then make a Noise roll. |

### Additional Rooms (5 of 9 per game)

| Room | Action |
|---|---|
| **Airlock Control** | Choose another Yellow Room whose Corridors hold no Destroyed Doors: close every Door around it and place the Airlock token. If all those Doors are still closed when the Player Phase ends, **everything in that Room dies** — crew and Bioforms — and any Fire there is removed. |
| **Cabins** | Passive: starting a turn here with no Bioforms present, draw 1 extra Action card (6 instead of 5). Disabled by a Malfunction. |
| **Canteen** | Heal 1 Light Wound. Optionally Scan all Contamination cards in hand and remove the clean ones (§9.1). |
| **Command Center** | Choose any Room and open or close any Doors around it, individually. |
| **Engine Control Room** | Check the status of all 3 Engines. Works through a Malfunction. Cannot change them. |
| **Hatch Control System** | Lock or unlock 1 Escape Pod. |
| **Monitoring Room** | Secretly look at any 1 unexplored Room tile and its Exploration token, then replace them. **You may lie about what you saw.** |
| **Room Covered With Slime** | Entering it gives you a Slime marker. No Search. |
| **Shower Room** | Discard your Slime marker. Optionally Scan all Contamination cards in hand and remove the clean ones. |
| **Storage** | Draw 2 from one Item deck of your choice, keep 1, bottom the other. |
| **Surgery** | Scan **all** your Contamination cards — deck, hand and discard — and remove every INFECTED one; remove a Larva from your board. Then suffer 1 Light Wound, **automatically pass**, and shuffle your whole Action deck back together. |

### Special Rooms (printed on the board, explored from the start, never searchable)

| Room | Action |
|---|---|
| **Cryobay** | Try to hibernate — only once the Time marker is on a blue space. Make a Noise roll; if any Bioform appears, the attempt fails. Otherwise you are out of the game, alive, pending the end-game checks. Never possible with a Bioform in the room. |
| **Cockpit** | Check Coordinates (look secretly, **you may lie**) **or** Set Destination (move the Destination marker). Neither is possible with a Bioform present, nor once anyone has hibernated. |
| **Engine 1 / 2 / 3** | Check this Engine — look secretly at the top token, **you may lie**. Repair/Break (with a Repairs Action or Tools) — take both tokens, look, and replace them **in an order of your choice**: you may lie about which you chose, but you must say truthfully whether you reordered them. Works through a Malfunction. |

## 13. Escape, Self-Destruct, and the end

**Escape Pods** start Locked. They unlock manually (Hatch Control System, some Items) or
automatically on the first crew death or when Self-Destruct turns critical. Boarding requires the
Evacuation Section Room with **no Bioform and no Malfunction**, and a Noise roll that produces no
Bioform. Each Pod seats 2. Launch immediately, or wait — but a waiting occupant **automatically
passes** each turn they do not launch, and may step out freely. If a Bioform reaches the Evacuation
Section, everyone in its Pods is dumped back into the Room. A launched Pod's occupants count as
having reached Earth. Heavy Objects take no seat.

**Self-Destruct** — started in the Generator. Its marker advances with the Time marker. Yellow space
→ unstoppable and all Pods unlock. Final space → the ship explodes. It cannot be started while
anyone is hibernating, and a hyperspace jump with the sequence active still destroys the ship.

### 13.1 End of the game

The game ends when any of:

- **The Time marker reaches the last red space** — the ship jumps immediately and everyone not in
  hibernation dies of acceleration. *Bioforms are unaffected* — an Objective to kill one still fails.
- **The Self-Destruct marker reaches the skull space, or a 9th Fire or 9th Malfunction marker is
  required** — the ship is destroyed and **everything** aboard dies, hibernating crew and Bioforms
  alike.
- **The last awake crew member dies, hibernates, or launches** — advance Self-Destruct (if active)
  or Time to its final space and resolve as above.

### 13.2 Victory check

Run in order, if at least one crew member survived:

1. **Engines** — reveal the three top Engine tokens. **2 or 3 Damaged → the ship explodes**, killing
   all hibernating crew and all Bioforms. A Malfunction marker in an Engine Room disables only that
   Room's Action; it never makes an Engine count as Damaged.
2. **Coordinates** — reveal the Coordinates card and read the Destination marker. Not headed for
   Earth → every hibernating crew member dies. *Exception:* a player holding the Quarantine
   Objective, which requires Mars, survives a Mars destination. Bioforms are unaffected, and the
   ship itself is not destroyed.
3. **Contamination** — each surviving crew member (hibernated or launched) Scans every Contamination
   card in deck, hand and discard. If **any** is INFECTED, they shuffle their entire deck together
   and draw the top 4: **any Contamination card among them — infected or not — kills them.** A crew
   member with a Larva on their board skips the Scan and goes straight to the draw.
4. **Objectives** — every player still alive reveals their Objective and checks its requirements.

**A player wins if and only if their Objective is complete and their crew member survived.** A
player whose crew member dies, hibernates or launches stops acting and spectates; their result is
settled at the end with everyone else's.
