import { useEffect } from 'react';
import { Game } from './screens/Game.js';
import { Lobby } from './screens/Lobby.js';
import { useNet } from './net.js';

export function App() {
  const { connect, connected, view, error, dismissError } = useNet();

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <>
      {!connected && (
        <div className="banner">
          Waking the server… the free tier sleeps when idle, so this can take up to a minute.
        </div>
      )}
      {error && (
        <div className="banner error" onClick={dismissError} role="alert">
          {error} <span className="muted">(click to dismiss)</span>
        </div>
      )}
      {view ? <Game view={view} /> : <Lobby />}
    </>
  );
}
