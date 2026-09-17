import { useState } from 'react';
import { MIN_PLAYERS, ROLES, ROLE_CONTENT, type Role } from '@cryosleep/shared';
import { useNet } from '../net.js';

export function Lobby() {
  const { lobby, code, playerId, createRoom, joinRoom, chooseRole, startGame, leave } = useNet();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  if (!code || !lobby) {
    return (
      <div className="panel entry">
        <h1>Cryosleep</h1>
        <p className="muted">
          Something is loose on the <em>Meridian</em>. Two to five crew, one screen each.
        </p>
        <label>
          Your name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
        </label>
        <div className="row">
          <button type="button" disabled={!name.trim()} onClick={() => createRoom(name.trim())}>
            Host a run
          </button>
        </div>
        <div className="row">
          <input
            placeholder="CODE"
            value={joinCode}
            maxLength={4}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          />
          <button
            type="button"
            disabled={!name.trim() || joinCode.length !== 4}
            onClick={() => joinRoom(joinCode, name.trim())}
          >
            Join
          </button>
        </div>
      </div>
    );
  }

  const me = lobby.seats.find((s) => s.id === playerId);
  const taken = new Set(lobby.takenRoles);

  return (
    <div className="panel entry">
      <h1>
        Room <span className="code">{lobby.code}</span>
      </h1>
      <ol className="seats">
        {lobby.seats.map((seat) => (
          <li key={seat.id} className={seat.connected ? '' : 'offline'}>
            <span>{seat.name}</span>
            <span className="muted">
              {seat.role ? ROLE_CONTENT[seat.role as Role].label : 'choosing…'}
              {seat.isHost ? ' · host' : ''}
            </span>
          </li>
        ))}
      </ol>

      <h2>Pick a role</h2>
      <div className="roles">
        {ROLES.map((role) => {
          const mine = me?.role === role;
          return (
            <button
              key={role}
              type="button"
              className={mine ? 'role picked' : 'role'}
              disabled={taken.has(role) && !mine}
              onClick={() => chooseRole(role)}
            >
              <strong>{ROLE_CONTENT[role].label}</strong>
              <span className="muted">{ROLE_CONTENT[role].blurb}</span>
            </button>
          );
        })}
      </div>

      <div className="row">
        <button type="button" disabled={!lobby.canStart || !me?.isHost} onClick={startGame}>
          {me?.isHost ? 'Wake the crew' : 'Waiting for the host'}
        </button>
        <button type="button" className="ghost" onClick={leave}>
          Leave
        </button>
      </div>
      {!lobby.canStart && (
        <p className="muted">
          {MIN_PLAYERS} or more crew, each with a role, before you can start.
        </p>
      )}
    </div>
  );
}
