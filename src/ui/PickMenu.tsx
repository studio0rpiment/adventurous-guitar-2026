import { useEffect, useRef, useState } from "react";
import { Logo } from "@/ui/Logo";
import { useEscape } from "@/lib/useEscape";
import { MEDIA } from "@/config/media";
import type { NavItem } from "@/config/nav";
import {
  FAN_H,
  FAN_W,
  LABEL_GAP,
  LABEL_SIZE,
  PICK_SIZE,
  PLATE_H,
  SPOKES,
  WORDMARK_W,
} from "@/ui/pickGeometry";

export type MenuItem = NavItem;

// Items and fan geometry are shared with the top nav bar — see @/config/nav
// and @/ui/pickGeometry. The mobile nav flies its buttons into these exact
// label slots when the pick opens, so both must read the same numbers.

// Shepherd School wordmark placement: closed (right of the pick) vs open
// (shrunk + tucked up-left, clear of the fan).
const LOGO_CLOSED = "translate(3.4rem, 0.05rem) scale(1)";
const LOGO_OPEN = "translate(0rem, -1.65rem) scale(0.6)";

/**
 * The corner pick as a navigation hub. Desktop (mouse): hover opens the fan.
 * Touch/pen: a tap toggles it — handled per pointer-type, so a touch device
 * never needs tap-and-hold. The Shepherd wordmark tucks up-left when open.
 */
export function PickMenu({
  onSelect,
  open: openProp,
  onOpenChange,
  showLabels = true,
}: {
  onSelect?: (id: string) => void;
  /** Controlled open state. Falls back to internal state when omitted. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Set false when something else is drawing the labels (the mobile nav). */
  showLabels?: boolean;
}) {
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp ?? openInternal;
  const setOpen = (next: boolean | ((o: boolean) => boolean)) => {
    const value = typeof next === "function" ? next(open) : next;
    setOpenInternal(value);
    onOpenChange?.(value);
  };
  const [mouseMode, setMouseMode] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPointer = useRef<string>("mouse");

  // Close on Escape or on any pointer down outside the menu (event-driven).
  useEscape(open, () => setOpen(false));
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  const select = (id: string) => {
    setOpen(false);
    onSelect?.(id);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", pointerEvents: "auto", width: "fit-content" }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") {
          setMouseMode(true);
          setOpen(true);
        }
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setOpen(false);
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "-0.5rem",
          top: "-0.4rem",
          width: `calc(${PLATE_H} + ${WORDMARK_W})`,
          height: PLATE_H,
          background: "rgba(0, 0, 0, 0.72)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          borderRadius: "0.6rem",
          pointerEvents: "none",
          opacity: open ? 0 : 1,
          transition: "opacity 0.3s ease",
        }}
      />

      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu"
        onPointerDown={(e) => {
          lastPointer.current = e.pointerType;
          if (e.pointerType !== "mouse") setMouseMode(false);
        }}
        onClick={() => {
          // Mouse is driven by hover; touch/pen taps toggle open/closed.
          if (lastPointer.current !== "mouse") setOpen((o) => !o);
        }}
        style={{
          appearance: "none",
          background: "none",
          border: 0,
          padding: 0,
          display: "block",
          cursor: "pointer",
          transform: open ? "rotate(-90deg)" : "rotate(0deg)",
          transformOrigin: "center",
          transition: "transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Logo size={PICK_SIZE} />
      </button>

      {/* Shepherd School wordmark — beside the pick when closed, tucked up-left
          out of the fan's way when open. Decorative. */}
      <img
        src={MEDIA.shepherdLogo}
        alt="Shepherd School of Music at Rice"
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: WORDMARK_W,
          height: "auto",
          transformOrigin: "top left",
          filter: "brightness(0) invert(1)",
          pointerEvents: "none",
          transform: open ? LOGO_OPEN : LOGO_CLOSED,
          transition: "transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1)",
        }}
      />

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: FAN_W,
            height: FAN_H,
            pointerEvents: "none",
          }}
        >
          {/* Keep-alive hit area for mouse: moving from the pick to an item
              across the gaps must not fire pointerleave. Not used on touch. */}
          {mouseMode && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }} />
          )}

          <svg
            width={FAN_W}
            height={FAN_H}
            viewBox={`0 0 ${FAN_W} ${FAN_H}`}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              overflow: "visible",
              pointerEvents: "none",
            }}
          >
            {SPOKES.map((s) => (
              <polyline
                key={s.id}
                points={`${s.sx.toFixed(1)},${s.sy.toFixed(1)} ${s.bx},${s.ly} ${s.lx},${s.ly}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth={1}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
          </svg>

          {showLabels && SPOKES.map((s, i) => (
            <button
              key={s.id}
              role="menuitem"
              type="button"
              className="ags-menu-item"
              onClick={() => select(s.id)}
              style={{
                position: "absolute",
                left: s.lx + LABEL_GAP,
                top: s.ly,
                transform: "translateY(-50%)",
                pointerEvents: "auto",
                appearance: "none",
                background: "none",
                border: 0,
                padding: "1px 3px",
                margin: 0,
                whiteSpace: "nowrap",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: LABEL_SIZE,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#ffffff",
                animation: `ags-menu-in 0.28s ease ${i * 0.05}s both`,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
