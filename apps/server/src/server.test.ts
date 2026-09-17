import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { io as connect, type Socket } from 'socket.io-client';
import type { ErrorPayload, JoinedPayload, LobbyState, PlayerView } from '@cryosleep/shared';
import { startServer, type RunningServer } from './server.js';
import { reset } from './rooms.js';

let server: RunningServer;
let url: string;
const clients: Client[] = [];

interface Pending {
  event: string;
  predicate: (payload: unknown) => boolean;
  resolve: (payload: never) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

/**
 * Buffers every server event, because the server broadcasts to a whole room: a
 * lobby update caused by another client can easily land between two sequential
 * awaits, and a listener registered afterwards would miss it forever.
 */
class Client {
  readonly socket: Socket;
  private readonly queues = new Map<string, unknown[]>();
  private readonly pending: Pending[] = [];

  constructor(url: string) {
    this.socket = connect(url, { transports: ['websocket'], forceNew: true });
    for (const event of ['joined', 'lobby', 'view', 'error_message']) {
      this.socket.on(event, (payload: unknown) => this.push(event, payload));
    }
  }

  private push(event: string, payload: unknown): void {
    if (event === 'error_message') {
      const message = (payload as { message: string }).message;
      for (const waiter of this.pending.splice(0)) {
        if (waiter.event === 'error_message') {
          clearTimeout(waiter.timer);
          waiter.resolve(payload as never);
        } else {
          clearTimeout(waiter.timer);
          waiter.reject(new Error(message));
        }
      }
      return;
    }

    const index = this.pending.findIndex((w) => w.event === event && w.predicate(payload));
    if (index >= 0) {
      const [waiter] = this.pending.splice(index, 1);
      if (waiter) {
        clearTimeout(waiter.timer);
        waiter.resolve(payload as never);
        return;
      }
    }

    this.queues.set(event, [...(this.queues.get(event) ?? []), payload]);
  }

  /** The next `event` payload matching `predicate`, buffered ones included. */
  take<T>(event: string, predicate: (payload: T) => boolean = () => true, timeoutMs = 4000) {
    const queue = this.queues.get(event) ?? [];
    const index = queue.findIndex((payload) => predicate(payload as T));
    if (index >= 0) {
      const [payload] = queue.splice(index, 1);
      this.queues.set(event, queue);
      return Promise.resolve(payload as T);
    }

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`timed out waiting for ${event}`)),
        timeoutMs,
      );
      this.pending.push({
        event,
        predicate: predicate as (payload: unknown) => boolean,
        resolve: resolve as (payload: never) => void,
        reject,
        timer,
      });
    });
  }

  emit(event: string, payload: unknown): void {
    this.socket.emit(event, payload);
  }

  close(): void {
    this.socket.disconnect();
  }
}

function client(): Client {
  const c = new Client(url);
  clients.push(c);
  return c;
}

beforeEach(async () => {
  reset();
  server = await startServer(0);
  url = `http://127.0.0.1:${server.port}`;
});

afterEach(async () => {
  for (const c of clients.splice(0)) c.close();
  await server.close();
});

async function twoPlayerGame(): Promise<{ host: Client; guest: Client; code: string }> {
  const host = client();
  const guest = client();

  host.emit('createRoom', { name: 'host' });
  const joined = await host.take<JoinedPayload>('joined');

  guest.emit('joinRoom', { code: joined.code, name: 'guest' });
  await guest.take<JoinedPayload>('joined');

  host.emit('chooseRole', { role: 'captain' });
  guest.emit('chooseRole', { role: 'scout' });
  await host.take<LobbyState>('lobby', (lobby) => lobby.canStart);

  host.emit('startGame', {});
  await Promise.all([host.take<PlayerView>('view'), guest.take<PlayerView>('view')]);

  return { host, guest, code: joined.code };
}

describe('lobby', () => {
  it('creates a room with a 4-letter code and seats the host', async () => {
    const host = client();
    host.emit('createRoom', { name: 'host' });

    const joined = await host.take<JoinedPayload>('joined');
    expect(joined.code).toMatch(/^[A-Z]{4}$/);

    const lobby = await host.take<LobbyState>('lobby');
    expect(lobby.seats).toHaveLength(1);
    expect(lobby.seats[0]?.isHost).toBe(true);
    expect(lobby.canStart).toBe(false);
  });

  it('will not start with only one crew member', async () => {
    const host = client();
    host.emit('createRoom', { name: 'host' });
    await host.take<JoinedPayload>('joined');

    host.emit('chooseRole', { role: 'captain' });
    const lobby = await host.take<LobbyState>('lobby', (l) => l.takenRoles.length === 1);
    expect(lobby.canStart).toBe(false);

    host.emit('startGame', {});
    expect((await host.take<ErrorPayload>('error_message')).message).toMatch(/needs a role/);
  });

  it('rejects a second crew member taking a taken role', async () => {
    const host = client();
    const guest = client();

    host.emit('createRoom', { name: 'host' });
    const joined = await host.take<JoinedPayload>('joined');

    guest.emit('joinRoom', { code: joined.code, name: 'guest' });
    await guest.take<JoinedPayload>('joined');

    host.emit('chooseRole', { role: 'captain' });
    await guest.take<LobbyState>('lobby', (l) => l.takenRoles.includes('captain'));

    guest.emit('chooseRole', { role: 'captain' });
    expect((await guest.take<ErrorPayload>('error_message')).message).toMatch(
      /already took that role/,
    );
  });

  it('refuses an unknown room code', async () => {
    const guest = client();
    guest.emit('joinRoom', { code: 'ZZZZ', name: 'guest' });

    expect((await guest.take<ErrorPayload>('error_message')).message).toMatch(/no such room/);
  });

  it('lets only the host start the game', async () => {
    const host = client();
    const guest = client();

    host.emit('createRoom', { name: 'host' });
    const joined = await host.take<JoinedPayload>('joined');
    guest.emit('joinRoom', { code: joined.code, name: 'guest' });
    await guest.take<JoinedPayload>('joined');

    host.emit('chooseRole', { role: 'captain' });
    guest.emit('chooseRole', { role: 'scout' });
    await guest.take<LobbyState>('lobby', (l) => l.canStart);

    guest.emit('startGame', {});
    expect((await guest.take<ErrorPayload>('error_message')).message).toMatch(/only the host/);
  });

  it('returns a refreshed player to their own seat', async () => {
    const host = client();
    host.emit('createRoom', { name: 'host' });
    const joined = await host.take<JoinedPayload>('joined');

    const returning = client();
    returning.emit('rejoin', { code: joined.code, token: joined.token });
    const rejoined = await returning.take<JoinedPayload>('joined');

    expect(rejoined.playerId).toBe(joined.playerId);
  });
});

describe('a started game', () => {
  it('sends both players a view of the same ship', async () => {
    const { host, guest } = await twoPlayerGame();

    host.emit('submitAction', { action: { kind: 'pass' } });
    const [a, b] = await Promise.all([
      host.take<PlayerView>('view'),
      guest.take<PlayerView>('view'),
    ]);

    expect(a.rooms.map((r) => r.id)).toEqual(b.rooms.map((r) => r.id));
  });

  it('moves a crew member and shows it on the other player screen', async () => {
    const { host, guest } = await twoPlayerGame();

    host.emit('submitAction', { action: { kind: 'move', to: 'cockpit' } });
    const [mine, theirs] = await Promise.all([
      host.take<PlayerView>('view', (v) => v.you.location === 'cockpit'),
      guest.take<PlayerView>('view', (v) =>
        v.crew.some((c) => c.role === 'captain' && c.location === 'cockpit'),
      ),
    ]);

    expect(mine.you.location).toBe('cockpit');
    expect(theirs.crew.find((c) => c.role === 'captain')?.location).toBe('cockpit');
  });

  it('refuses an action from the player whose turn it is not', async () => {
    const { guest } = await twoPlayerGame();

    guest.emit('submitAction', { action: { kind: 'move', to: 'cockpit' } });
    expect((await guest.take<ErrorPayload>('error_message')).message).toMatch(/not your turn/);
  });

  it('refuses a move to a room that is not connected', async () => {
    const { host } = await twoPlayerGame();

    host.emit('submitAction', { action: { kind: 'move', to: 'room-c' } });
    expect((await host.take<ErrorPayload>('error_message')).message).toMatch(/not connected/);
  });

  it('rejects a malformed action instead of crashing', async () => {
    const { host } = await twoPlayerGame();

    host.emit('submitAction', { action: { kind: 'teleport', to: 'cockpit' } });
    expect((await host.take<ErrorPayload>('error_message')).message).toBeTruthy();
  });

  it('never puts server-only state or another player hand on the wire', async () => {
    const { host } = await twoPlayerGame();

    host.emit('submitAction', { action: { kind: 'pass' } });
    const view = await host.take<PlayerView>('view');

    expect(view).not.toHaveProperty('hidden');
    expect(view).not.toHaveProperty('players');
    for (const member of view.crew) {
      expect(member).not.toHaveProperty('hand');
      expect(member).not.toHaveProperty('objectives');
    }
    expect(Object.keys(view.you)).toContain('objectives');
  });

  it('tells each player only their own legal actions', async () => {
    const { host, guest } = await twoPlayerGame();

    host.emit('submitAction', { action: { kind: 'move', to: 'cockpit' } });
    const [mine, theirs] = await Promise.all([
      host.take<PlayerView>('view', (v) => v.you.location === 'cockpit'),
      guest.take<PlayerView>('view', (v) =>
        v.crew.some((c) => c.location === 'cockpit'),
      ),
    ]);

    expect(mine.legalActions.length).toBeGreaterThan(0);
    expect(theirs.legalActions).toEqual([]);
  });
});
