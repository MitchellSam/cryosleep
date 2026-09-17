import { ROLE_CONTENT, ROOMS, type PlayerView, type Role, type RoomId } from '@cryosleep/shared';
import { ShipMap } from '../components/ShipMap.js';
import { useNet } from '../net.js';

function roomName(id: RoomId): string {
  return ROOMS.find((r) => r.id === id)?.name ?? id;
}

function roleLabel(role: Role | null): string {
  return role ? ROLE_CONTENT[role].label : 'Unassigned';
}

export function Game({ view }: { view: PlayerView }) {
  const submitAction = useNet((s) => s.submitAction);
  const yourTurn = view.activePlayer === view.you.id;
  const canPass = view.legalActions.some((a) => a.kind === 'pass');

  return (
    <div className="game">
      <header className="rail">
        <span>TURN {view.turn}</span>
        <span className="muted">
          {yourTurn ? 'Your round' : `${roleLabel(crewRole(view, view.activePlayer))} is acting`}
        </span>
        <span className="actions">
          {'◆'.repeat(view.you.actionsRemaining)}
          <span className="spent">
            {'◇'.repeat(Math.max(0, view.actionsPerRound - view.you.actionsRemaining))}
          </span>
        </span>
      </header>

      <aside className="left">
        <section>
          <h2>Crew</h2>
          <ul className="crew">
            {view.crew.map((member) => (
              <li key={member.id} className={member.connected ? '' : 'offline'}>
                <strong>{roleLabel(member.role)}</strong>
                <span className="muted">{roomName(member.location)}</span>
                <span className="muted">
                  {member.handSize} cards · {member.lightWounds} light
                  {member.passed ? ' · passed' : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="log">
          <h2>Log</h2>
          <ul>
            {[...view.log]
              .slice(-12)
              .reverse()
              .map((entry, i) => (
                <li key={`${entry.turn}-${i}`}>
                  <span className="muted">t{entry.turn}</span> {entry.text}
                </li>
              ))}
          </ul>
        </section>
      </aside>

      <main>
        <ShipMap view={view} onMove={(to) => submitAction({ kind: 'move', to })} />
      </main>

      <aside className="right">
        <h2>{roleLabel(view.you.role)}</h2>
        <p className="muted">You are in {roomName(view.you.location)}.</p>
        <dl>
          <dt>Light wounds</dt>
          <dd>{view.you.lightWounds}</dd>
          <dt>Hand</dt>
          <dd>{view.you.hand.length === 0 ? 'empty (cards land in M4)' : view.you.hand.join(', ')}</dd>
          <dt>Objective</dt>
          <dd>
            {view.you.objectives.length === 0
              ? 'none dealt yet (objectives land in M9)'
              : view.you.objectives.join(', ')}
          </dd>
        </dl>
        <button type="button" disabled={!canPass} onClick={() => submitAction({ kind: 'pass' })}>
          Pass
        </button>
        <p className="secrecy">Only you can see this panel. The server never sends it elsewhere.</p>
      </aside>
    </div>
  );
}

function crewRole(view: PlayerView, id: string | null): Role | null {
  if (!id) return null;
  if (id === view.you.id) return view.you.role;
  return view.crew.find((c) => c.id === id)?.role ?? null;
}
