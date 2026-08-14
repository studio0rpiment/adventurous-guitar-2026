import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { SOCKETS } from "@/three/socket/layout";

export interface SocketRef {
  id: number;
  pos: THREE.Vector3;
  dir: THREE.Vector3; // insertion axis (outward normal) — our sockets face +Z
}

interface ConnectionCtx {
  sockets: SocketRef[];
  aligningId: number | null;
  setAligningId: (id: number | null) => void;
  nearestSocket: (
    px: number,
    py: number,
    camera: THREE.Camera,
    width: number,
    height: number,
    maxPx: number,
  ) => number;
  tryGrab: (key: string) => boolean;
  releaseGrab: (key: string) => void;
}

const Ctx = createContext<ConnectionCtx | null>(null);

/**
 * Holds the shared socket layout and the connect/disconnect coordination so any
 * cable can seat a plug into any socket. `nearestSocket` projects sockets to
 * screen space; `tryGrab`/`releaseGrab` enforce one grabbed plug at a time;
 * `aligningId` drives the socket's approach glow.
 */
export function ConnectionProvider({ children }: { children: ReactNode }) {
  const sockets = useMemo<SocketRef[]>(
    () =>
      SOCKETS.map((s, id) => ({
        id,
        pos: new THREE.Vector3(...s.pos),
        dir: new THREE.Vector3(0, 0, 1),
      })),
    [],
  );
  const [aligningId, setAligningId] = useState<number | null>(null);
  const grabbed = useRef<string | null>(null);
  const proj = useMemo(() => new THREE.Vector3(), []);

  const value = useMemo<ConnectionCtx>(
    () => ({
      sockets,
      aligningId,
      setAligningId,
      nearestSocket: (px, py, camera, width, height, maxPx) => {
        let idx = -1;
        let best = maxPx;
        for (const s of sockets) {
          proj.copy(s.pos).project(camera);
          const sx = (proj.x * 0.5 + 0.5) * width;
          const sy = (-proj.y * 0.5 + 0.5) * height;
          const d = Math.hypot(sx - px, sy - py);
          if (d < best) {
            best = d;
            idx = s.id;
          }
        }
        return idx;
      },
      tryGrab: (key) => {
        if (grabbed.current) return false;
        grabbed.current = key;
        return true;
      },
      releaseGrab: (key) => {
        if (grabbed.current === key) grabbed.current = null;
      },
    }),
    [sockets, aligningId, proj],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useConnection(): ConnectionCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useConnection must be used within <ConnectionProvider>");
  return c;
}
