/**
 * Crew roles. The published game has exactly six characters; we keep their role
 * names (generic occupational nouns) and drop the personal names entirely —
 * see the naming policy in SPEC.md.
 */
export const ROLES = ['captain', 'pilot', 'scientist', 'scout', 'soldier', 'mechanic'] as const;

export type Role = (typeof ROLES)[number];

export interface RoleContent {
  readonly id: Role;
  /** Shown wherever the crew member is named. Never a personal name. */
  readonly label: string;
  readonly blurb: string;
}

export const ROLE_CONTENT: Readonly<Record<Role, RoleContent>> = {
  captain: { id: 'captain', label: 'Captain', blurb: 'Gives orders the implants make hard to refuse.' },
  pilot: { id: 'pilot', label: 'Pilot', blurb: 'Knows the hull, the course, and what it costs to change it.' },
  scientist: { id: 'scientist', label: 'Scientist', blurb: 'Would rather understand the thing than shoot it.' },
  scout: { id: 'scout', label: 'Scout', blurb: 'Moves quietly and comes back with more than they left with.' },
  soldier: { id: 'soldier', label: 'Soldier', blurb: 'Brought the heavier gun, and the ammunition for it.' },
  mechanic: { id: 'mechanic', label: 'Mechanic', blurb: 'The only one who fits in the ducts, and fixes what burns.' },
};
