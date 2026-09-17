import { useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import { CORRIDORS, ROOMS, type RoomId } from '@cryosleep/shared';
import type { CrewView, LegalAction, PlayerView } from '@cryosleep/shared';

const UNIT = 90;
const ROOM_R = 34;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;

interface Props {
  view: PlayerView;
  onMove: (to: RoomId) => void;
}

/**
 * The ship, and the action interface. Rooms are tapped to act on them; the legal
 * actions come from the server (view.legalActions) — the client never decides
 * what is allowed.
 */
export function ShipMap({ view, onMove }: Props) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<RoomId | null>(null);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const moveTargets = new Set(
    view.legalActions.flatMap((a: LegalAction) => (a.kind === 'move' ? [a.to] : [])),
  );
  const occupants = new Map<RoomId, CrewView[]>();
  for (const member of view.crew) {
    occupants.set(member.location, [...(occupants.get(member.location) ?? []), member]);
  }

  function onWheel(event: WheelEvent<SVGSVGElement>) {
    const nextZoom = zoom * (event.deltaY < 0 ? 1.1 : 1 / 1.1);
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom)));
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const start = drag.current;
    if (!start) return;
    setPan({
      x: start.panX + (event.clientX - start.x) / zoom,
      y: start.panY + (event.clientY - start.y) / zoom,
    });
  }

  function onPointerUp() {
    drag.current = null;
  }

  return (
    <div className="map">
      <svg
        viewBox="-260 -260 520 520"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <g transform={`scale(${zoom}) translate(${pan.x} ${pan.y})`}>
          {CORRIDORS.map((corridor) => {
            const [fromId, toId] = corridor.between;
            const from = ROOMS.find((r) => r.id === fromId);
            const to = ROOMS.find((r) => r.id === toId);
            if (!from || !to) return null;
            return (
              <g key={corridor.id} className="corridor">
                <line x1={from.x * UNIT} y1={from.y * UNIT} x2={to.x * UNIT} y2={to.y * UNIT} />
                <text
                  x={((from.x + to.x) / 2) * UNIT}
                  y={((from.y + to.y) / 2) * UNIT}
                  dy="0.32em"
                >
                  {corridor.number}
                </text>
              </g>
            );
          })}

          {ROOMS.map((room) => {
            const state = view.rooms.find((r) => r.id === room.id);
            const here = view.you.location === room.id;
            const others = occupants.get(room.id) ?? [];
            const reachable = moveTargets.has(room.id);
            const classes = [
              'room',
              state?.explored ? 'explored' : 'unexplored',
              here ? 'you' : '',
              reachable ? 'reachable' : '',
              selected === room.id ? 'selected' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <g
                key={room.id}
                className={classes}
                transform={`translate(${room.x * UNIT} ${room.y * UNIT})`}
                onClick={() => setSelected(selected === room.id ? null : room.id)}
              >
                <circle r={ROOM_R} />
                <text dy="-0.2em">{state?.explored ? room.name : '???'}</text>
                {(here || others.length > 0) && (
                  <text className="pips" dy="1.1em">
                    {here ? '◆' : ''}
                    {others.map(() => '◇').join('')}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {selected && (
        <div className="room-actions">
          <h3>{view.rooms.find((r) => r.id === selected)?.explored ? roomName(selected) : '???'}</h3>
          {moveTargets.has(selected) ? (
            <button
              type="button"
              onClick={() => {
                onMove(selected);
                setSelected(null);
              }}
            >
              Move here <span className="cost">◆</span>
            </button>
          ) : (
            <p className="muted">
              {view.you.location === selected
                ? 'You are here.'
                : 'Not connected to your room, or not your turn.'}
            </p>
          )}
        </div>
      )}

      <div className="map-hint">drag to pan · scroll to zoom</div>
    </div>
  );
}

function roomName(id: RoomId): string {
  return ROOMS.find((r) => r.id === id)?.name ?? id;
}
