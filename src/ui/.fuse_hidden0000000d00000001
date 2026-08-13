import { useEffect, useRef, useState } from "react";
import { Logo } from "@/ui/Logo";

export interface MenuItem {
  id: string;
  label: string;
}

const ITEMS: MenuItem[] = [
  { id: "schedule", label: "Schedule" },
  { id: "participants", label: "Participants" },
  { id: "locations", label: "Locations" },
  { id: "about", label: "About" },
];

/* Fan geometry (px, relative to the container's top-left). Each leader is an
   angled line from ORIGIN to a bend, then a horizontal shelf to the label —
   the same technical-manual language as the Rice callout. Items are evenly
   spaced vertically (ROW) with a diagonal x-stagger (X_STEP). Tune freely. */
const TIP_X = 40; // pick tip center
const TIP_Y = 24;
const START_R = 11; // leaders start on this radius around the tip (gap from it)
const TOP_Y = 6; // y of the first (top) item
const ROW = 24; // vertical spacing between items
const RIGHT_X = 116; // label x of the top item (furthest right)
const X_STEP = 20; // how much each row steps left (the stagger)
const SHELF = 16; // horizontal shelf length into the label

const SPOKES = ITEMS.map((it, i) => {
  const ly = TOP_Y + i * ROW;
  const lx = RIGHT_X - i * X_STEP;
  const bx = lx - SHELF;
  // Start each leader on a circle of radius START_R around the tip, aimed at
  // its bend — detached from the pick and fanned apart.
  const dx = bx - TIP_X;
  const dy = ly - TIP_Y;
  const len = Math.hypot(dx, dy) || 1;
  const sx = TIP_X + (dx / len) * START_R;
  const sy = TIP_Y + (dy / len) * START_R;
  return { ...it, lx, ly, bx, sx, sy };
});
const FAN_W = 240;
const FAN_H = TOP_Y + (ITEMS.length - 1) * ROW + 30;

/**
 * The corner pick as a navigation hub. Hover (desktop) or tap (mobile) rotates
 * the pick 90° (tip points left) and fans four leader-line routes out to the
 * right. Routing is stubbed — `onSelect` fires with the item id; wire it to
 * real navigation once the sections exist.
 */
export function PickMenu({ onSelect }: { onSelect?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCapable] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  );

  // Close on Escape or on any pointer down outside the menu (event-driven).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const select = (id: string) => {
    setOpen(false);
    onSelect?.(id);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", pointerEvents: "auto", width: "fit-content" }}
      onPointerEnter={hoverCapable ? () => setOpen(true) : undefined}
      onPointerLeave={hoverCapable ? () => setOpen(false) : undefined}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu"
        onClick={() => {
          if (!hoverCapable) setOpen((o) => !o);
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
        <Logo size="3rem" />
      </button>

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
          {/* Keep-alive hit area so moving from the pick to an item (across the
              empty gaps) doesn't fire pointerleave and close the menu. */}
          {hoverCapable && (
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

          {SPOKES.map((s, i) => (
            <button
              key={s.id}
              role="menuitem"
              type="button"
              className="ags-menu-item"
              onClick={() => select(s.id)}
              style={{
                position: "absolute",
                left: s.lx + 5,
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
                fontSize: "clamp(0.5rem, 2.1vw, 0.6rem)",
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
