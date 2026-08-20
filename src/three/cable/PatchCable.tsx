import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Cable } from "./Cable";
import { JackPlug } from "./JackPlug";
import { createDrapedRope, stepRope } from "./verlet";
import { EXIT_LOCAL, JACK_AXIS, ROPE, TARGET_LEN } from "./constants";
import { useConnection } from "@/three/connection/ConnectionContext";
import { screenDistance } from "@/three/screen";

const ALIGN_PX = 150; // within this screen distance the plug turns to face the jack
const SEAT_PX = 46; // within this it seats (plugs in)
const ARM_PX = 55; // must pull a plug out this far before it can (re)seat
const OUTSET = 0.58 * TARGET_LEN; // how far the plug's cable-exit sits out of the socket face
const DRAPE = 1.6; // rope length as a multiple of the initial gap
const HIT_RADIUS = 0.32; // invisible hover tube radius (visible tube is ~0.075)

// Hover sway — smoothed so it eases in as you move and eases out when you stop.
const SWAY = 0.0035; // how strongly mouse motion feeds the sway
const SWAY_MAX = 0.5; // clamp accumulated sway so fast moves do not fling
const SWAY_EASE = 0.22; // fraction of accumulated sway applied per frame (ease-in)
const SWAY_DECAY = 0.85; // per-frame decay of accumulated sway (ease-out)

let SEQ = 0;

interface EndState {
  plugged: number | null;
  aligning: number;
  anchor: THREE.Vector3;
  q: THREE.Quaternion;
}

/**
 * A patch cable with two connectable plugs (grab -> pull out -> drag -> re-seat).
 * Hovering the cable makes it sway with the mouse (eased). When BOTH ends are
 * unplugged the cable docks to its storage hook on the left and hangs down.
 */
export function PatchCable({
  color,
  initialA = null,
  initialB = null,
  storageHook,
}: {
  color: string;
  initialA?: number | null;
  initialB?: number | null;
  storageHook: [number, number, number];
}) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const { sockets, nearestSocket, tryGrab, releaseGrab, setAligningId } = useConnection();

  const id = useMemo(() => `c${SEQ++}`, []);
  const hook = useMemo(() => new THREE.Vector3(...storageHook), [storageHook]);

  const a0 = useMemo(() => {
    const s = initialA != null ? sockets[initialA] : null;
    return s ? s.pos.clone().addScaledVector(s.dir, OUTSET) : hook.clone();
  }, [sockets, initialA, hook]);
  const b0 = useMemo(() => {
    const s = initialB != null ? sockets[initialB] : null;
    return s ? s.pos.clone().addScaledVector(s.dir, OUTSET) : hook.clone().setY(hook.y - 2);
  }, [sockets, initialB, hook]);

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
  const armed = useRef(false);
  const grabStart = useRef({ x: 0, y: 0 });
  const docked = useRef(false);
  const hovered = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const cableRef = useRef<THREE.Mesh>(null);
  const hitRef = useRef<THREE.Mesh>(null);
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
  const tan = useMemo(() => new THREE.Vector3(), []);
  const targetQ = useMemo(() => new THREE.Quaternion(), []);
  const exit = useMemo(() => new THREE.Vector3(), []);
  const camRight = useMemo(() => new THREE.Vector3(), []);
  const camUp = useMemo(() => new THREE.Vector3(), []);
  const swayVel = useMemo(() => new THREE.Vector3(), []);

  const setNdc = (clientX: number, clientY: number) => {
    const r = gl.domElement.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
  };

  const beginGrab = (endIdx: 0 | 1) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!tryGrab(`${id}-${endIdx}`)) return;
    const end = ends.current[endIdx];
    end.plugged = null;
    end.aligning = -1;
    if (endIdx === 0) docked.current = false;
    const ptIdx = endIdx === 0 ? 0 : pts.length - 1;
    end.anchor.copy(pts[ptIdx].p);
    camera.getWorldDirection(nrm);
    plane.setFromNormalAndCoplanarPoint(nrm, end.anchor);
    setNdc(e.nativeEvent.clientX, e.nativeEvent.clientY);
    ray.setFromCamera(ndc, camera);
    ray.ray.intersectPlane(plane, gStart);
    aStart.copy(end.anchor);
    grabStart.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
    armed.current = false;
    grabIdx.current = endIdx;
    gl.domElement.style.cursor = "grabbing";
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const gi = grabIdx.current;
      if (gi !== null) {
        const end = ends.current[gi];
        setNdc(e.clientX, e.clientY);
        ray.setFromCamera(ndc, camera);
        if (ray.ray.intersectPlane(plane, hit)) end.anchor.copy(aStart).add(hit.sub(gStart));
        if (!armed.current) {
          const dd = Math.hypot(e.clientX - grabStart.current.x, e.clientY - grabStart.current.y);
          if (dd > ARM_PX) armed.current = true;
        }
        const near = nearestSocket(e.clientX, e.clientY, camera, size.width, size.height, ALIGN_PX);
        end.aligning = near;
        setAligningId(near >= 0 ? near : null);
        if (armed.current && near >= 0) {
          const s = sockets[near];
          if (screenDistance(s.pos, camera, size.width, size.height, e.clientX, e.clientY) < SEAT_PX) {
            end.plugged = near;
            end.anchor.copy(s.pos).addScaledVector(s.dir, OUTSET);
            end.aligning = -1;
            releaseGrab(`${id}-${gi}`);
            grabIdx.current = null;
            setAligningId(null);
            gl.domElement.style.cursor = "default";
          }
        }
      } else if (hovered.current) {
        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;
        if (dx || dy) {
          camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
          camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
          swayVel.addScaledVector(camRight, dx * SWAY).addScaledVector(camUp, -dy * SWAY);
          const m = swayVel.length();
          if (m > SWAY_MAX) swayVel.multiplyScalar(SWAY_MAX / m);
        }
      }
      last.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => {
      const gi = grabIdx.current;
      if (gi === null) return;
      ends.current[gi].aligning = -1;
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
    const lastI = pts.length - 1;
    const e0 = ends.current[0];
    const e1 = ends.current[1];

    if (grabIdx.current === 0 || e0.plugged !== null) docked.current = false;
    else if (e0.plugged === null && e1.plugged === null && grabIdx.current === null) docked.current = true;

    pts[0].pinned = grabIdx.current === 0 || e0.plugged !== null || docked.current;
    pts[lastI].pinned = grabIdx.current === 1 || e1.plugged !== null;
    if (docked.current && grabIdx.current !== 0 && e0.plugged === null) e0.anchor.copy(hook);

    // eased hover sway: apply a fraction of the accumulated motion, then decay it
    if (swayVel.lengthSq() > 1e-9) {
      const n = pts.length;
      for (let i = 1; i < n - 1; i++) {
        if (pts[i].pinned) continue;
        const w = Math.sin((Math.PI * i) / (n - 1));
        pts[i].p.addScaledVector(swayVel, SWAY_EASE * w);
      }
      swayVel.multiplyScalar(SWAY_DECAY);
    }

    stepRope(pts, e0.anchor, e1.anchor, seg);

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
      const hm = hitRef.current;
      if (hm) {
        const hgeo = new THREE.TubeGeometry(curve, ROPE.tubeSegments, HIT_RADIUS, 6, false);
        hm.geometry.dispose();
        hm.geometry = hgeo;
      }
    }
    placeJack(jackARef.current, e0, 0, 1);
    placeJack(jackBRef.current, e1, lastI, lastI - 1);
  });

  const plugOver = () => {
    if (grabIdx.current === null) gl.domElement.style.cursor = "grab";
  };
  const plugOut = () => {
    if (grabIdx.current === null) gl.domElement.style.cursor = "default";
  };
  const cableOver = (e: ThreeEvent<PointerEvent>) => {
    hovered.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };
  const cableOut = () => {
    hovered.current = false;
  };

  return (
    <group>
      <Cable ref={cableRef} hitRef={hitRef} color={color} onPointerOver={cableOver} onPointerOut={cableOut} />
      <JackPlug ref={jackARef} onPointerDown={beginGrab(0)} onPointerOver={plugOver} onPointerOut={plugOut} />
      <JackPlug ref={jackBRef} onPointerDown={beginGrab(1)} onPointerOver={plugOver} onPointerOut={plugOut} />
    </group>
  );
}
