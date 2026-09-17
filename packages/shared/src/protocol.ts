import { z } from 'zod';
import { ROLES } from './content/roles.js';

export const PROTOCOL_VERSION = 1;

/** Room codes are 4 uppercase letters; I, O and similar are excluded to stay readable aloud. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const ROOM_CODE_LENGTH = 4;

export const roomCodeSchema = z
  .string()
  .length(ROOM_CODE_LENGTH)
  .regex(new RegExp(`^[${ROOM_CODE_ALPHABET}]+$`), 'invalid room code');

export const playerNameSchema = z.string().trim().min(1).max(24);

export const roleSchema = z.enum(ROLES);

export const actionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('move'), to: z.string().min(1) }),
  z.object({ kind: z.literal('pass') }),
]);

export type Action = z.infer<typeof actionSchema>;

/** client -> server */
export const clientMessages = {
  createRoom: z.object({ name: playerNameSchema }),
  joinRoom: z.object({ code: roomCodeSchema, name: playerNameSchema }),
  rejoin: z.object({ code: roomCodeSchema, token: z.string().min(1) }),
  chooseRole: z.object({ role: roleSchema }),
  startGame: z.object({}),
  submitAction: z.object({ action: actionSchema }),
} as const;

export type CreateRoom = z.infer<typeof clientMessages.createRoom>;
export type JoinRoom = z.infer<typeof clientMessages.joinRoom>;
export type Rejoin = z.infer<typeof clientMessages.rejoin>;
export type ChooseRole = z.infer<typeof clientMessages.chooseRole>;
export type SubmitAction = z.infer<typeof clientMessages.submitAction>;

/** server -> client */
export interface LobbySeat {
  readonly id: string;
  readonly name: string;
  readonly role: string | null;
  readonly connected: boolean;
  readonly isHost: boolean;
}

export interface LobbyState {
  readonly code: string;
  readonly seats: readonly LobbySeat[];
  readonly takenRoles: readonly string[];
  readonly canStart: boolean;
}

export interface JoinedPayload {
  readonly code: string;
  readonly playerId: string;
  /** Stored client-side so a refresh can rejoin the same seat. */
  readonly token: string;
  readonly protocolVersion: number;
}

export interface ErrorPayload {
  readonly message: string;
}
