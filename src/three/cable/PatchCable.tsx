import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Cable } from "./Cable";
import { JackPlug } from "./JackPlug";
import { createDrapedRope, stepRope } from "./verlet";
import { EXIT_LOCAL, JACK_AXIS, ROPE, TARGET_LEN } from "./constants";
import { useConnection } from "@/three/connection/ConnectionContext";

const ALIGN_PX = 150; // within this screen distance the plug turns to face the jack
const SEAT_PX = 46; // within this it seats (plugs in)
const OUTSET = 0.58 * TARGET_LEN; // how far the plug's cable-exit sits out of the socket face
const DRAPE = 1.6; // rope length as a multiple of the initial gap

let SEQ = 0;

interface EndState {
  plugged: number | null;
  aligning: number;
  anchor: THREE.Vector3;
  q: THREE.Quaternion;
}

/**
 * A patch cable whose two plugs can be grabbed, pulled out of a socket, dragged,
 * and re-seated into any socket — the connect/disconnect method ported from the
 * plug-scene prototype. An unplugged end hangs free. Sockets come from the
 * ConnectionProvider; `initialA`/`initialB` are the socket ids it starts seated in.
 */
export function PatchCable({
  color,
  initialA = null,
  initialB = null,
}: {
  color: string;
  initialA?: number | null;
  initialB?: number | null;
}) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const { sockets, nearestSocket, tryGrab, releaseGrab, setAligningId } = useConnection();

  const id = useMemo(() => `c${SEQ++}`, []);

  const a0 = useMemo(() => {
    const s = initialA != null ? sockets[initialA] : null;
    return s ? s.pos.clone().addScaledVector(s.dir, OUTSET) : new THREE.Vector3(-3, 1, 2);
  }, [sockets, initialA]);
  const b0 = useMemo(() => {
    const s = initialB != null ? sockets[initialB] : null;
    return s ? s.pos.clone().addScaledVector(s.dir, OUTSET) : new THREE.Vector3(3, 1, 2);
  }, [sockets, initialB]);

  const restLen = useMemo(() => {
    const d = a0.distanceTo(b0);
    return Math.max(d * DRAPE, d + 1);
  }, [a0, b0]);
  const seg = restLen / (ROPE.count - 1);
  const pts = useMemo(() => createDrapedRope(a0, b0, restLen), [a0, b0, restLen]);

  const ends = useRef<[EndState, EndState]>([
    { plugged: initialA, aligning: -1, anchor: a0.clone(), q: new THREE.Quaternion() },
    { plugged: initialB, aligning: -1, anchor: b0.clone(), q: new THREE.Quaternion() },
  ]);
  const grabIdx = useRef<0 | 1 | null>(null);

  const cableRef = useRef<THREE.Mesh>(null);
  const jackARef = useRef<THREE.Group>(null);
  const jackBRef = useRef<THREE.Group>(null);

  // scratch
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const plane = useMemo(() => new THREE.Plane(), []);
  const nrm = useMemo(() => new THREE.Vector3(), []);
  const gStart = useMemo(() => new THREE.Vector3(), []);
  const aStart = useMemo(() => new THREE.Vector3(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const tan = useMemo(() => new THREE.Vector3(), []);
  const targetQ = useMemo(() => new THREE.Quaternion(), []);
  const exit = useMemo(() => new THREE.Vector3(), []);

  const setNdc = (clientX: number, clientY: number) => {
    const r = gl.domElement.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
  };

  const beginGrab = (endIdx: 0 | 1) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!tryGrab(`${id}-${endIdx}`)) return;
    const end = ends.current[endIdx];
    end.plugged = null; // unplug on grab
    end.aligning = -1;
    const ptIdx = endIdx === 0 ? 0 : pts.length - 1;
    end.anchor.copy(pts[ptIdx].p); // grab from the plug's current position
    camera.getWorldDirection(nrm);
    plane.setFromNormalAndCoplanarPoint(nrm, end.anchor);
    setNdc(e.nativeEvent.clientX, e.nativeEvent.clientY);
    ray.setFromCamera(ndc, camera);
    ray.ray.intersectPlane(plane, gStart);
    aStart.copy(end.anchor);
    grabIdx.current = endIdx;
    gl.domElement.style.cursor = "grabbing";
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const gi = grabIdx.current;
      if (gi === null) return;
      const end = ends.current[gi];
      setNdc(e.clientX, e.clientY);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) end.anchor.copy(aStart).add(hit.sub(gStart));
      // phase 1: align to the nearest socket; phase 2: seat when moved onto it
      const near = nearestSocket(e.clientX, e.clientY, camera, size.width, size.height, ALIGN_PX);
      end.aligning = near;
      setAligningId(near >= 0 ? near : null);
      if (near >= 0) {
        const s = sockets[near];
        proj.copy(s.pos).project(camera);
        const sx = (proj.x * 0.5 + 0.5) * size.width;
        const sy = (-proj.y * 0.5 + 0.5) * size.height;
        if (Math.hypot(sx - e.clientX, sy - e.clientY) < SEAT_PX) {
          end.plugged = near;
          end.anchor.copy(s.pos).addScaledVector(s.dir, OUTSET);
          end.aligning = -1;
          releaseGrab(`${id}-${gi}`);
          grabIdx.current = null;
          setAligningId(null);
          gl.domElement.style.cursor = "default";
        }
      }
    };
    const onUp = () => {
      const gi = grabIdx.current;
      if (gi === null) return;
      ends.current[gi].aligning = -1; // if not seated, the end goes free and falls
      releaseGrab(`${id}-${gi}`);
      grabIdx.current = null;
      setAligningId(null);
      gl.domElement.style.cursor = "default";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, size, sockets]);

  const placeJack = (grp: THREE.Group | null, end: EndState, endIdx: number, nextIdx: number) => {
    if (!grp) return;
    if (end.plugged !== null) {
      targetQ.setFromUnitVectors(JACK_AXIS, sockets[end.plugged].dir);
      end.q.copy(targetQ);
    } else if (end.aligning >= 0) {
      targetQ.setFromUnitVectors(JACK_AXIS, sockets[end.aligning].dir);
      end.q.slerp(targetQ, 0.22);
    } else {
      tan.subVectors(pts[nextIdx].p, pts[endIdx].p).normalize();
      targetQ.setFromUnitVectors(JACK_AXIS, tan);
      end.q.slerp(targetQ, 0.3);
    }
    grp.quaternion.copy(end.q);
    exit.copy(EXIT_LOCAL).applyQuaternion(end.q);
    grp.position.copy(pts[endIdx].p).sub(exit);
  };

  useFrame(() => {
    const last = pts.length - 1;
    pts[0].pinned = grabIdx.current === 0 || ends.current[0].plugged !== null;
    pts[last].pinned = grabIdx.current === 1 || ends.current[1].plugged !== null;
    stepRope(pts, ends.current[0].anchor, ends.current[1].anchor, seg);
    const mesh = cableRef.current;
    if (mesh) {
      const curve = new THREE.CatmullRomCurve3(
        pts.map((q) => q.p),
        false,
        "catmullrom",
        0.5,
      );
      const geo = new THREE.TubeGeometry(curve, ROPE.tubeSegments, ROPE.radius, ROPE.tubeRadial, false);
      mesh.geometry.dispose();
      mesh.geometry = geo;
    }
    placeJack(jackARef.current, ends.current[0], 0, 1);
    placeJack(jackBRef.current, ends.current[1], last, last - 1);
  });

  const onOver = () => {
    if (grabIdx.current === null) gl.domElement.style.cursor = "grab";
  };
  const onOut = () => {
    if (grabIdx.current === null) gl.domElement.style.cursor = "default";
  };

  return (
    <group>
      <Cable ref={cableRef} color={color} />
      <JackPlug ref={jackARef} onPointerDown={beginGrab(0)} onPointerOver={onOver} onPointerOut={onOut} />
      <JackPlug ref={jackBRef} onPointerDown={beginGrab(1)} onPointerOver={onOver} onPointerOut={onOut} />
    </group>
  );
}
