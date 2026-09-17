import { io, type Socket } from 'socket.io-client';
import { create } from 'zustand';
import type { Action, ErrorPayload, JoinedPayload, LobbyState, PlayerView } from '@cryosleep/shared';

const SERVER_URL = import.meta.env['VITE_SERVER_URL'] ?? 'http://localhost:3001';
const SESSION_KEY = 'cryosleep.session';

interface StoredSession {
  code: string;
  token: string;
}

function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession | null): void {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    // Private windows and blocked storage are fine; reconnect just won't survive a refresh.
  }
}

interface NetState {
  socket: Socket | null;
  connected: boolean;
  playerId: string | null;
  code: string | null;
  lobby: LobbyState | null;
  view: PlayerView | null;
  error: string | null;
  connect: () => void;
  createRoom: (name: string) => void;
  joinRoom: (code: string, name: string) => void;
  chooseRole: (role: string) => void;
  startGame: () => void;
  submitAction: (action: Action) => void;
  leave: () => void;
  dismissError: () => void;
}

export const useNet = create<NetState>((set, get) => ({
  socket: null,
  connected: false,
  playerId: null,
  code: null,
  lobby: null,
  view: null,
  error: null,

  connect: () => {
    if (get().socket) return;

    const socket = io(SERVER_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      set({ connected: true });
      const session = readSession();
      if (session) socket.emit('rejoin', session);
    });
    socket.on('disconnect', () => set({ connected: false }));

    socket.on('joined', (payload: JoinedPayload) => {
      writeSession({ code: payload.code, token: payload.token });
      set({ playerId: payload.playerId, code: payload.code, error: null });
    });
    socket.on('lobby', (lobby: LobbyState) => set({ lobby, view: null }));
    socket.on('view', (view: PlayerView) => set({ view }));
    socket.on('error_message', (payload: ErrorPayload) => set({ error: payload.message }));

    set({ socket });
  },

  createRoom: (name) => get().socket?.emit('createRoom', { name }),
  joinRoom: (code, name) => get().socket?.emit('joinRoom', { code: code.toUpperCase(), name }),
  chooseRole: (role) => get().socket?.emit('chooseRole', { role }),
  startGame: () => get().socket?.emit('startGame', {}),
  submitAction: (action) => get().socket?.emit('submitAction', { action }),

  leave: () => {
    writeSession(null);
    set({ playerId: null, code: null, lobby: null, view: null, error: null });
  },

  dismissError: () => set({ error: null }),
}));
