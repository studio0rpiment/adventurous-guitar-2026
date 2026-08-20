import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Cable } from "./Cable";
import { JackPlug } from "./JackPlug";
import { createHangingRope, stepRope } from "./verlet";
import { EXIT_LOCAL, JACK_AXIS, ROPE } from "./constants";

type End = "A" | "B";

/**
 * One cable hung by its top plug: the top end is pinned at `top` and the rest
 * hangs straight down (lower plug dangling free). `color` sets the tube colour.
 * Either plug is grabbable — the grabbed end pins to the pointer; releasing the
 * bottom lets it swing back and hang free again. Repeat with different
 * `top`/`color` for a row.
 */
export function HangingCable({
  top,
  color,
}: {
  top: THREE.Vector3;
  color: string;
}) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);

  const pts = useMemo(() => createHangingRope(top), [top]);
  const anchorA = useRef(top.clone());
  const anchorB = useRef(top.clone());

  const cableRef = useRef<THREE.Mesh>(null);
  const jackARef = useRef<THREE.Group>(null);
  const jackBRef = useRef<THREE.Group>(null);

  const grab = useRef<{
    end: End;
    plane: THREE.Plane;
    grabStart: THREE.Vector3;
    anchorStart: THREE.Vector3;
  } | null>(null);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  const setNdc = (e: PointerEvent) => {
    const r = gl.domElement.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  };

  const beginGrab = (end: End) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const endIdx = end === "A" ? 0 : pts.length - 1;
    const anchor = end === "A" ? anchorA.current : anchorB.current;
    anchor.copy(pts[endIdx].p); // start the grab from the plug's current position
    pts[endIdx].pinned = true; // hold this end while dragging
    const nrm = new THREE.Vector3();
    camera.getWorldDirection(nrm);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(nrm, anchor);
    setNdc(e.nativeEvent);
    raycaster.setFromCamera(ndc, camera);
    const gs = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, gs);
    grab.current = { end, plane, grabStart: gs, anchorStart: anchor.clone() };
    gl.domElement.style.cursor = "grabbing";
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const g = grab.current;
      if (!g) return;
      setNdc(e);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(g.plane, tmp)) {
        const anchor = g.end === "A" ? anchorA.current : anchorB.current;
        anchor.copy(g.anchorStart).add(tmp.sub(g.grabStart));
      }
    };
    const onUp = () => {
      const g = grab.current;
      if (!g) return;
      // The bottom end goes back to hanging free once released; the top stays put.
      if (g.end === "B") pts[pts.length - 1].pinned = false;
      grab.current = null;
      gl.domElement.style.cursor = "default";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl]);

  const tan = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const exit = useMemo(() => new THREE.Vector3(), []);

  const placeJack = (grp: THREE.Group | null, endIdx: number, nextIdx: number) => {
    if (!grp) return;
    tan.subVectors(pts[nextIdx].p, pts[endIdx].p).normalize();
    quat.setFromUnitVectors(JACK_AXIS, tan);
    grp.quaternion.copy(quat);
    exit.copy(EXIT_LOCAL).applyQuaternion(quat);
    grp.position.copy(pts[endIdx].p).sub(exit);
  };

  useFrame(() => {
    stepRope(pts, anchorA.current, anchorB.current);
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
    placeJack(jackARef.current, 0, 1);
    placeJack(jackBRef.current, pts.length - 1, pts.length - 2);
  });

  const onOver = () => {
    gl.domElement.style.cursor = "grab";
  };
  const onOut = () => {
    if (!grab.current) gl.domElement.style.cursor = "default";
  };

  return (
    <group>
      <Cable ref={cableRef} color={color} />
      <JackPlug ref={jackARef} onPointerDown={beginGrab("A")} onPointerOver={onOver} onPointerOut={onOut} />
      <JackPlug ref={jackBRef} onPointerDown={beginGrab("B")} onPointerOver={onOver} onPointerOut={onOut} />
    </group>
  );
}
