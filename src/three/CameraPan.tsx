import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type * as THREE from "three";
import {
  cameraRestY,
  ISLAND_FIELD_SELECTOR,
  PAN_START_FALLBACK,
} from "@/three/guitar/layout";
import { visibleHalfHeight } from "@/three/ResponsiveCamera";
import { scrollProgress, smoothstep, watchScroll } from "@/lib/scroll";

/**
 * Slides the camera down to the floor once the islands are done.
 *
 * Reading the sockets as a wall: after the last island the camera drops, so the
 * cables travel up and out of frame and the guitar on the floor comes into
 * view. We move the CAMERA rather than the cable rig on purpose — the patch
 * cables do their drag/seat math by raycasting from screen coords into world
 * space, so translating that rig would put every plug out of register with its
 * socket. Moving the camera leaves all of it correct for free.
 *
 * Where the descent starts is MEASURED, not guessed: the scroll position at
 * which the island field's bottom edge passes the top of the viewport, so the
 * islands are fully gone before the guitar arrives — however many there are.
 * Recomputed on resize only — the field's document offset doesn't change while
 * scrolling, so there's no per-scroll layout read.
 *
 * Pure translation: no lookAt here, so the framing doesn't tilt as it descends.
 */
export function CameraPan() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const progress = useRef(0);
  const start = useRef(PAN_START_FALLBACK);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLElement>(ISLAND_FIELD_SELECTOR);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (!el || max <= 0) {
        start.current = PAN_START_FALLBACK;
        return;
      }
      // Document-space Y of the island field's bottom edge. The descent starts
      // when that edge reaches the TOP of the viewport — i.e. once the last
      // island has slid up and out — and runs through the empty spacer after it.
      const bottomDoc = el.getBoundingClientRect().bottom + window.scrollY;
      const startScroll = bottomDoc;
      start.current = Math.min(0.97, Math.max(0, startScroll / max));
    };

    measure();
    window.addEventListener("resize", measure);
    const stop = watchScroll(() => {
      progress.current = scrollProgress();
    });
    return () => {
      stop();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useFrame(() => {
    const s = start.current;
    const t = smoothstep((progress.current - s) / Math.max(0.001, 1 - s));

    // Everything downstream is a function of how much world this viewport
    // sees, so a phone descends further than a desktop and both end up with
    // the cable rig off the top and the guitar framed the same way.
    const halfH = visibleHalfHeight(camera.fov, size.width / size.height);
    const target = t * cameraRestY(halfH);

    camera.position.y += (target - camera.position.y) * 0.1;
  });

  return null;
}
